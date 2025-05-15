import { Injectable } from '@angular/core';
import { FSObject } from './model/fs-object.model';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { AppRegistryService } from "./app-registry.service";

@Injectable({
  providedIn: 'root'
})
export class FileSystemService {
  // In-memory file system store
  private fsObjects = new Map<string, FSObject>();
  private fsObjects$: BehaviorSubject<Map<string, FSObject>>;

  public readonly ROOT_ID = 'root';
  public readonly DESKTOP_ID = 'desktop_folder';

  constructor(private appRegistry: AppRegistryService) {
    this.initializeFileSystem();
    this.fsObjects$ = new BehaviorSubject(new Map(this.fsObjects)); // Make a copy for BehaviorSubject
  }

  private initializeFileSystem(): void {
    const initialFs: FSObject[] = [
      // Root Level / Drives (conceptual)
      { id: this.ROOT_ID, parentId: null, name: 'My Computer', type: 'FOLDER', icon: 'assets/images/fs-icons/computer.png' },
      { id: 'drive_c', parentId: this.ROOT_ID, name: 'Local Disk (C:)', type: 'FOLDER', icon: 'assets/images/fs-icons/drive.png' },

      // C: Drive Contents
      { id: 'program_files', parentId: 'drive_c', name: 'Program Files', type: 'FOLDER', icon: 'assets/images/fs-icons/folder.png' },
      { id: 'users_folder', parentId: 'drive_c', name: 'Users', type: 'FOLDER', icon: 'assets/images/fs-icons/folder.png' },

      // Users/You Folder
      { id: 'user_user', parentId: 'users_folder', name: 'DefaultUser', type: 'FOLDER', icon: 'assets/images/fs-icons/folder.png' },
      { id: this.DESKTOP_ID, parentId: 'user_user', name: 'Desktop', type: 'FOLDER', icon: 'assets/images/fs-icons/folder.png' },
      { id: 'documents_folder', parentId: 'user_user', name: 'Documents', type: 'FOLDER', icon: 'assets/images/fs-icons/folder.png' },

      // Desktop Contents
      // {
      //   id: 'textpad_shortcut_desktop', parentId: this.DESKTOP_ID, name: 'TextPad.exe', type: 'FILE',
      //   fileType: 'APP_SHORTCUT', content: 'textPadApp', // appId
      //   icon: 'assets/images/app-icons/textpad.png',
      // },
      // {
      //   id: 'file_explorer_shortcut_desktop', parentId: this.DESKTOP_ID, name: 'File Explorer.exe', type: 'FILE',
      //   fileType: 'APP_SHORTCUT', content: 'fileExplorerApp', // appId
      //   icon: 'assets/images/app-icons/file_explorer.png',
      // },
      // {
      //   id: 'readme_desktop', parentId: this.DESKTOP_ID, name: 'README.txt', type: 'FILE',
      //   fileType: 'txt', content: 'ReadMe text', defaultAppId: 'textPadApp',
      //   icon: 'assets/images/fs-icons/file_txt.png'
      // },

      // Documents Contents
      {
        id: 'about_me_doc', parentId: this.DESKTOP_ID, name: 'README_Alaap.txt', type: 'FILE',
        fileType: 'txt', defaultAppId: 'textPadApp',
        icon: 'assets/images/fs-icons/file_txt.png', contentPath: 'assets/file-data/about-me.txt'
      },
      {
        id: 'contact_doc', parentId: this.DESKTOP_ID, name: 'Contact.md', type: 'FILE',
        fileType: 'md', defaultAppId: 'textPadApp',
        icon: 'assets/images/fs-icons/file_md.png', contentPath: 'assets/file-data/contact.md'
      },

      // Program Files / App Shortcuts (can also be used for a "Start Menu")
      // {
      //   id: 'textpad_shortcut_programs', parentId: 'program_files', name: 'TextPad Editor', type: 'FILE',
      //   fileType: 'APP_SHORTCUT', content: 'textPadApp', icon: 'assets/images/app-icons/textpad.png'
      // },
      // {
      //   id: 'file_explorer_shortcut_programs', parentId: 'program_files', name: 'File Explorer', type: 'FILE',
      //   fileType: 'APP_SHORTCUT', content: 'fileExplorerApp', icon: 'assets/images/app-icons/file_explorer.png'
      // },
    ];

    initialFs.forEach(obj => this.fsObjects.set(obj.id, obj));

    this.appRegistry.getAllAppDefinitions().forEach(app => this.fsObjects.set(`${app.appId}_shortcut`, {
      id: `${app.appId}_shortcut`,
      parentId: 'program_files',
      name: app.name,
      type: 'FILE',
      fileType: 'APP_SHORTCUT',
      content: app.appId,
      icon: app.icon,
    }));
  }

  public getObjectById(id: string): Observable<FSObject | undefined> {
    return this.fsObjects$.pipe(
      map(fsMap => fsMap.get(id))
    );
  }

  public getChildren(folderId: string): Observable<FSObject[]> {
    return this.fsObjects$.pipe(
      map(fsMap => {
        const children: FSObject[] = [];
        fsMap.forEach(obj => {
          if (obj.parentId === folderId) {
            children.push(obj);
          }
        });
        return children.sort((a, b) => { // Basic sort: folders first, then by name
          if (a.type === 'FOLDER' && b.type === 'FILE') return -1;
          if (a.type === 'FILE' && b.type === 'FOLDER') return 1;
          return a.name.localeCompare(b.name);
        });
      })
    );
  }

  public getPath(objectId: string, fsMap: Map<string, FSObject>): string {
    // Helper to get full path, can be called internally or made public
    let currentObject = fsMap.get(objectId);
    if (!currentObject) return 'Unknown Path';

    const pathParts: string[] = [];
    while (currentObject && currentObject.parentId !== null) {
      pathParts.unshift(currentObject.name);
      currentObject = fsMap.get(currentObject.parentId);
    }
    // Add the root/drive name if currentObject is now a drive or root conceptual item
    if (currentObject) {
      pathParts.unshift(currentObject.name);
    } else if (fsMap.get(objectId)?.parentId === this.ROOT_ID) {
      // If parent was root, but root itself wasn't part of path building
      const driveObject = fsMap.get(fsMap.get(objectId)!.parentId!);
      if (driveObject) pathParts.unshift(driveObject.name);
    }


    return pathParts.join('/'); // Or '\' for Windows style
  }

  // For FileExplorer path display
  public getCurrentPathString(folderId: string): Observable<string> {
    return this.fsObjects$.pipe(
      map(fsMap => this.getPath(folderId, fsMap))
    );
  }
}