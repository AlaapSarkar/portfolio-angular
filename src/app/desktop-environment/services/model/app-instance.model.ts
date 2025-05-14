import { Type } from '@angular/core';

export interface AppInstance {
    id: string; // Unique ID for this specific app instance
    appId: string; // Which app definition this instance is for
    title: string;
    componentToRender: Type<any>;
    data?: any; // Optional data to pass to the component

    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
    isActive: boolean;
    isMinimized: boolean;
}