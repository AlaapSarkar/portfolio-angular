import { Type } from '@angular/core';

export interface AppDefinition {
    appId: string; // Unique identifier for the app type
    name: string; // Display name / Default window title
    icon?: string; // Path to an icon image
    component: Type<any>; // The Angular component to render for this app
    allowMultipleInstances: boolean;
    defaultWidth?: number;
    defaultHeight?: number;
    supportedFileTypes?: string[];
}