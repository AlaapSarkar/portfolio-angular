import { Injectable, Type } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppInstance } from './model/app-instance.model';
import { AppRegistryService } from './app-registry.service';

@Injectable({
  providedIn: 'root'
})
export class DesktopManagerService {
  private static nextWindowId = 1;
  private static nextZIndex = 100;

  private windowsSubject = new BehaviorSubject<AppInstance[]>([]);
  public windows$: Observable<AppInstance[]> = this.windowsSubject.asObservable();

  constructor(private appRegistryService: AppRegistryService) { }

  public launchApp(appId: string, data?: any): void {
    const appDef = this.appRegistryService.getAppDefinition(appId);
    if (!appDef) {
      console.error(`App with ID "${appId}" not found.`);
      return;
    }

    let openWindows = this.windowsSubject.getValue();

    // Handle single instance
    if (!appDef.allowMultipleInstances) {
      const existingWindow = openWindows.find(w => w.appId === appId);
      if (existingWindow) {
        this.focusWindow(existingWindow.id);
        return;
      }
    }

    const newWindowId = `window-${DesktopManagerService.nextWindowId++}`;
    const newZIndex = DesktopManagerService.nextZIndex++;

    const newWindow: AppInstance = {
      id: newWindowId,
      appId: appDef.appId,
      title: appDef.name, // Could be dynamic based on data
      componentToRender: appDef.component,
      data: data,
      x: 50 + (openWindows.length % 10) * 30, // Cascade new windows
      y: 50 + (openWindows.length % 10) * 30,
      width: appDef.defaultWidth || 400,
      height: appDef.defaultHeight || 300,
      zIndex: newZIndex,
      isActive: true,
      isMinimized: false,
    };

    // Deactivate other windows
    openWindows = openWindows.map(w => ({ ...w, isActive: false }));

    this.windowsSubject.next([...openWindows, newWindow]);
  }

  public focusWindow(windowId: string): void {
    let windows = this.windowsSubject.getValue();
    const targetWindowIndex = windows.findIndex(w => w.id === windowId);

    if (targetWindowIndex === -1) return; // Window not found

    const targetWindow = windows[targetWindowIndex];

    // If already active and not minimized, nothing to do for focus itself
    if (targetWindow.isActive && !targetWindow.isMinimized) {
      return;
    }

    const maxZIndex = DesktopManagerService.nextZIndex++;

    windows = windows.map((w, index) => {
      if (index === targetWindowIndex) {
        // This is the window to focus
        return {
          ...w,
          isActive: true,
          isMinimized: false, // Always unminimize when focusing
          zIndex: maxZIndex
        };
      } else {
        // Other windows become inactive
        return {
          ...w,
          isActive: false
          // Keep their zIndex and isMinimized state unless they were the previously active one
        };
      }
    });

    this.windowsSubject.next(windows);
  }

  public closeWindow(windowId: string): void {
    let windows = this.windowsSubject.getValue();
    const closedWindow = windows.find(w => w.id === windowId);
    windows = windows.filter(w => w.id !== windowId);

    // If the closed window was active, try to focus the next highest z-index window
    if (closedWindow?.isActive && windows.length > 0) {
      let nextActiveWindow = windows.reduce((prev, current) => (prev.zIndex > current.zIndex) ? prev : current);
      this.focusWindow(nextActiveWindow.id);
    }
    this.windowsSubject.next(windows);
  }

  public moveWindow(windowId: string, newX: number, newY: number): void {
    const windows = this.windowsSubject.getValue().map(w =>
      w.id === windowId ? { ...w, x: newX, y: newY } : w
    );
    this.windowsSubject.next(windows);
  }

  public resizeWindow(windowId: string, newWidth: number, newHeight: number): void {
    const windows = this.windowsSubject.getValue().map(w =>
      w.id === windowId ? { ...w, width: newWidth, height: newHeight } : w
    );
    this.windowsSubject.next(windows);
  }

  public toggleMinimize(windowId: string): void {
    let windows = this.windowsSubject.getValue();
    const targetWindowIndex = windows.findIndex(w => w.id === windowId);

    if (targetWindowIndex === -1) return; // Window not found

    const targetWindow = windows[targetWindowIndex];
    const isNowMinimized = !targetWindow.isMinimized;

    windows = windows.map((w, index) =>
      index === targetWindowIndex ? { ...w, isMinimized: isNowMinimized, isActive: isNowMinimized ? false : w.isActive } : w
      // If minimizing, also make it inactive. If unminimizing, retain its current active status (focusWindow will handle making it truly active if needed)
    );

    // console.log(windows[targetWindowIndex]);

    // If we just minimized the currently active window, focus another one if available
    if (isNowMinimized && targetWindow.isActive) {
      this.windowsSubject.next(windows);

      const otherNonMinimizedWindows = windows.filter(w => w.id !== windowId && !w.isMinimized);
      // console.log('erfreg1');
      if (otherNonMinimizedWindows.length > 0) {
        // console.log('erfreg2');
        // Find the one with the highest zIndex among the remaining visible windows
        const nextActiveWindow = otherNonMinimizedWindows.reduce((prev, current) =>
          (prev.zIndex > current.zIndex) ? prev : current
        );
        // Call focusWindow to properly set active state and zIndex
        // This is safe because nextActiveWindow is not the one we just minimized
        this.focusWindow(nextActiveWindow.id); // This call will now update 'windows' again via the BehaviorSubject
        return; // Exit early as focusWindow will emit the final state
      }
    } else if (!isNowMinimized) {
      // console.log('erfreg3');
      this.windowsSubject.next(windows);
      // If we just unminimized a window, ensure it becomes focused.
      // This handles the case where it was minimized but not active.
      this.focusWindow(windowId); // This is safe, focusWindow handles if already active.
      return; // Exit early as focusWindow will emit the final state
    }

    this.windowsSubject.next(windows);
  }
}