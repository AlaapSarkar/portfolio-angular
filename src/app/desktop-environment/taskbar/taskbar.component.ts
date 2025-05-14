import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DesktopManagerService } from '../services/desktop-manager.service';
import { AppRegistryService } from '../services/app-registry.service';
import { AppInstance } from '../services/model/app-instance.model';
import { Subscription } from 'rxjs';
import { AppDefinition } from '../services/model/app-definition.model';


@Component({
  selector: 'de-taskbar', // DE for Desktop Environment to avoid name clash
  standalone: true,
  imports: [CommonModule],
  templateUrl: './taskbar.component.html',
  styleUrls: ['./taskbar.component.scss']
})
export class DETaskbarComponent implements OnInit, OnDestroy { // Renamed component class
  openWindows: AppInstance[] = [];
  minimizedWindows: AppInstance[] = [];
  private windowsSubscription!: Subscription;

  constructor(
    public desktopManager: DesktopManagerService,
    public appRegistry: AppRegistryService
  ) { }

  ngOnInit(): void {
    this.windowsSubscription = this.desktopManager.windows$.subscribe(windows => {
      this.openWindows = windows.filter(w => !w.isMinimized);
      this.minimizedWindows = windows.filter(w => w.isMinimized);
    });
  }

  launchTestApp(): void {
    this.desktopManager.launchApp('testApp');
  }

  launchFileExplorer(): void {
    this.desktopManager.launchApp('fileExplorerApp');
  }

  taskbarWindowClick(windowId: string): void {
    this.desktopManager.focusWindow(windowId); // This will also unminimize
  }

  getAppIcon(appId: string): string | undefined {
    return this.appRegistry.getAppDefinition(appId)?.icon;
  }


  ngOnDestroy(): void {
    if (this.windowsSubscription) {
      this.windowsSubscription.unsubscribe();
    }
  }
}