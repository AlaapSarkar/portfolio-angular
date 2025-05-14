import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, Observable } from 'rxjs';
import { DesktopManagerService } from '../services/desktop-manager.service';
import { AppInstance } from '../services/model/app-instance.model';
import { WindowComponent } from '../window/window.component';
import { FileSystemService } from '../services/file-system.service';
import { FSObject } from '../services/model/fs-object.model';

@Component({
  selector: 'app-desktop',
  imports: [CommonModule, WindowComponent],
  templateUrl: './desktop.component.html',
  styleUrls: ['./desktop.component.scss']
})
export class DesktopComponent implements OnInit, OnDestroy {
  runningInstances: AppInstance[] = [];
  desktopItems$: Observable<FSObject[]>; // For desktop icons
  private windowsSubscription!: Subscription;

  // Store desktop icon positions (simple version)
  // todo, persist this to localStorage
  private desktopIconPositions: Map<string, { x: number, y: number }> = new Map();
  private nextIconX = 20;
  private nextIconY = 20;

  constructor(
    public desktopManager: DesktopManagerService,
    private fileSystem: FileSystemService
  ) {
    this.desktopItems$ = this.fileSystem.getChildren(this.fileSystem.DESKTOP_ID);
  }

  ngOnInit(): void {
    this.windowsSubscription = this.desktopManager.windows$.subscribe(windows => {
      // this.runningInstances = windows.filter(w => !w.isMinimized); // Only render non-minimized windows
      this.runningInstances = windows;
    });
  }

  ngOnDestroy(): void {
    if (this.windowsSubscription) {
      this.windowsSubscription.unsubscribe();
    }
  }

  // Event handlers delegated from WindowComponent
  handleCloseRequested(windowId: string): void {
    this.desktopManager.closeWindow(windowId);
  }

  handleFocusRequested(windowId: string): void {
    this.desktopManager.focusWindow(windowId);
  }

  handleMinimizeRequested(windowId: string): void {
    this.desktopManager.toggleMinimize(windowId);
  }

  handleDragged(event: { id: string, x: number, y: number }): void {
    this.desktopManager.moveWindow(event.id, event.x, event.y);
  }

  // In desktop.component.ts
  handleDesktopClick(event: MouseEvent): void {
    // If click is directly on desktop surface (not on a window)
    if ((event.target as HTMLElement).classList.contains('desktop-surface')) {
      // Potentially de-focus all windows or a specific action
      // For now, let's log it
      console.log('Desktop clicked');
      // Example: De-focus all windows by focusing a "null" window or a specific behavior in service
      // this.desktopManager.focusWindow('__DESKTOP__'); // Or similar concept
    }
  }

  // We'll need a trackBy function for *ngFor for performance
  trackByWindowId(index: number, window: AppInstance): string {
    return window.id;
  }

  // desktop icons functions
  getDesktopItemPosition(itemId: string): { x: number, y: number } {
    if (!this.desktopIconPositions.has(itemId)) {
      // Simple auto-placement for new icons
      this.desktopIconPositions.set(itemId, { x: this.nextIconX, y: this.nextIconY });
      this.nextIconY += 80; // Adjust spacing
      // if (this.nextIconY > (window.innerHeight - 120)) { // crude wrap
      //   this.nextIconY = 20;
      //   this.nextIconX += 100;
      // }
    }
    return this.desktopIconPositions.get(itemId)!;
  }

  onDesktopItemDoubleClick(item: FSObject): void {
    console.log('Desktop item double clicked:', item);
    if (item.fileType === 'APP_SHORTCUT' && item.content) {
      this.desktopManager.launchApp(item.content); // item.content is appId
    } else if (item.defaultAppId) {
      // Pass fileId and name to the app
      this.desktopManager.launchApp(item.defaultAppId, { fileId: item.id, fileName: item.name });
    } else {
      console.warn('No default app or action for desktop item:', item.name);
    }
  }

  getItemIcon(item: FSObject): string { // Copied from FileExplorer for now, could be a shared utility
    if (item.icon) return item.icon;
    if (item.type === 'FOLDER') return 'assets/images/fs-icons/folder.png';
    switch (item.fileType) {
      case 'txt': return 'assets/images/fs-icons/file_txt.png';
      case 'md': return 'assets/images/fs-icons/file_md.png';
      case 'APP_SHORTCUT': return 'assets/images/fs-icons/executable.png';
      default: return 'assets/images/fs-icons/file_unknown.png';
    }
  }
}