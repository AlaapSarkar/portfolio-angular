import { Injectable, Type } from '@angular/core';
import { AppDefinition } from './model/app-definition.model'; // Assuming this model is now shared or moved

// Import app components
import { TestApplicationComponent } from '../../applications/test/test.component';
import { FileExplorerAppComponent } from '../../applications/file-explorer-app/file-explorer-app.component';
import { TextPadAppComponent } from '../../applications/text-pad-app/text-pad-app.component';

@Injectable({
  providedIn: 'root'
})
export class AppRegistryService {
  private appDefinitions: Map<string, AppDefinition> = new Map();

  constructor() {
    this.registerApps();
  }

  private registerApps(): void {
    this.registerApp({
      appId: 'testApp',
      name: 'Test App',
      icon: 'assets/images/app-icons/test.png', // Placeholder
      component: TestApplicationComponent,
      allowMultipleInstances: true,
      defaultWidth: 300,
      defaultHeight: 200
    });

    this.registerApp({
      appId: 'fileExplorerApp',
      name: 'File Explorer',
      icon: 'assets/images/app-icons/file_explorer.png',
      component: FileExplorerAppComponent,
      allowMultipleInstances: true,
      defaultWidth: 600,
      defaultHeight: 400
    });

    this.registerApp({
      appId: 'textPadApp',
      name: 'TextPad',
      icon: 'assets/images/app-icons/textpad.png',
      component: TextPadAppComponent,
      allowMultipleInstances: true,
      defaultWidth: 600,
      defaultHeight: 450,
      supportedFileTypes: ['txt', 'md', 'log']
    });

    /*
    this.registerApp({
      appId: 'textPadApp',
      name: 'TextPad',
      icon: 'assets/images/app-icons/textpad.png',
      component: TextPadAppComponent,
      allowMultipleInstances: true,
      defaultWidth: 500,
      defaultHeight: 400,
      supportedFileTypes: ['txt', 'md', 'log']
    });
    */
  }

  public registerApp(definition: AppDefinition): void {
    if (this.appDefinitions.has(definition.appId)) {
      console.warn(`AppRegistryService: App with ID "${definition.appId}" already registered. Overwriting.`);
    }
    this.appDefinitions.set(definition.appId, definition);
  }

  public getAppDefinition(appId: string): AppDefinition | undefined {
    return this.appDefinitions.get(appId);
  }

  public getAllAppDefinitions(): AppDefinition[] {
    return Array.from(this.appDefinitions.values());
  }

  public getDefaultAppForFileType(fileType: string): AppDefinition | undefined {
    // Iterate through apps and check their 'supportedFileTypes'
    for (const appDef of this.appDefinitions.values()) {
      if (appDef.supportedFileTypes?.includes(fileType)) {
        return appDef;
      }
    }
    return undefined; // Or return a generic "unknown file type" handler app
  }
}