import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, Observable, BehaviorSubject, switchMap } from 'rxjs';
import { FileSystemService } from '../../desktop-environment/services/file-system.service';
import { FSObject } from '../../desktop-environment/services/model/fs-object.model';
import { DesktopManagerService } from '../../desktop-environment/services/desktop-manager.service'; // For launching

@Component({
  selector: 'app-file-explorer-app',
  imports: [CommonModule],
  templateUrl: './file-explorer-app.component.html',
  styleUrls: ['./file-explorer-app.component.scss']
})
export class FileExplorerAppComponent implements OnInit, OnDestroy {
  @Input() data?: { initialFolderId?: string }; // Optional initial folder

  currentFolderId$: BehaviorSubject<string>;
  currentPath$: Observable<string>;
  itemsInCurrentFolder$: Observable<FSObject[]>;

  private pathSubscription!: Subscription;
  currentPathDisplay: string = '';

  constructor(
    public fileSystem: FileSystemService,
    private desktopManager: DesktopManagerService // Inject for future file launching
  ) {
    const initialId = this.data?.initialFolderId || this.fileSystem.ROOT_ID; // Start at root or C:
    this.currentFolderId$ = new BehaviorSubject<string>(initialId);

    this.itemsInCurrentFolder$ = this.currentFolderId$.pipe(
      switchMap(folderId => this.fileSystem.getChildren(folderId))
    );
    this.currentPath$ = this.currentFolderId$.pipe(
      switchMap(folderId => this.fileSystem.getCurrentPathString(folderId))
    );
  }

  ngOnInit(): void {
    if (this.data?.initialFolderId) {
      this.navigateToFolder(this.data.initialFolderId);
    } else {
      this.navigateToFolder(this.fileSystem.ROOT_ID); // Default to root or C:
    }
    this.pathSubscription = this.currentPath$.subscribe(path => this.currentPathDisplay = path);
  }

  navigateToFolder(folderId: string): void {
    this.currentFolderId$.next(folderId);
  }

  goUpOneLevel(): void {
    const currentFolderId = this.currentFolderId$.getValue();
    if (currentFolderId === this.fileSystem.ROOT_ID) return; // Can't go up from root

    this.fileSystem.getObjectById(currentFolderId).subscribe(currentFolder => {
      if (currentFolder && currentFolder.parentId) {
        this.navigateToFolder(currentFolder.parentId);
      } else if (currentFolder && currentFolder.parentId === null && currentFolder.id !== this.fileSystem.ROOT_ID) {
        // This case handles if currentFolder is a drive under root.
        // Root's parentId is null, drives' parentId is ROOT_ID
        this.navigateToFolder(this.fileSystem.ROOT_ID);
      }
    });
  }

  handleItemClick(item: FSObject): void {
    if (item.type === 'FOLDER') {
      this.navigateToFolder(item.id);
    } else if (item.type === 'FILE') {
      // MVP: Just log for now. Later, launch app.
      console.log('Attempting to open file:', item);
      if (item.fileType === 'APP_SHORTCUT' && item.content) {
        this.desktopManager.launchApp(item.content); // item.content is appId
      } else if (item.defaultAppId) {
        this.desktopManager.launchApp(item.defaultAppId, { fileId: item.id, fileName: item.name });
      } else {
        console.warn('No default app or action for file type:', item.fileType);
      }
    }
  }

  // Helper to get a default icon if item.icon is not set
  getItemIcon(item: FSObject): string {
    if (item.icon) return item.icon;
    if (item.type === 'FOLDER') return 'assets/images/fs-icons/folder.png';
    switch (item.fileType) {
      case 'txt': return 'assets/images/fs-icons/file_txt.png';
      case 'md': return 'assets/images/fs-icons/file_md.png';
      case 'APP_SHORTCUT': return 'assets/images/fs-icons/executable.png'; // Generic shortcut
      default: return 'assets/images/fs-icons/file_unknown.png';
    }
  }

  ngOnDestroy(): void {
    if (this.pathSubscription) this.pathSubscription.unsubscribe();
  }
}