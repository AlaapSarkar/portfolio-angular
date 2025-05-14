export type FSObjectType = 'FILE' | 'FOLDER';
export type FileType = 'txt' | 'md' | 'png' | 'jpg' | 'APP_SHORTCUT' | 'UNKNOWN';

export interface FSObject {
    id: string;          // Unique identifier
    parentId: string | null; // ID of the parent folder, null for root/drives
    name: string;        // e.g., "MyFile.txt", "Documents"
    type: FSObjectType;  // 'FILE' or 'FOLDER'

    // Properties specific to FILE type
    fileType?: FileType; // e.g., "txt", "md", "APP_SHORTCUT"
    content?: any;       // For APP_SHORTCUT (appId), small text files, or path for others
    defaultAppId?: string; // AppId that opens this file type

    // General properties
    icon?: string;       // Path to a specific icon image
    createdAt?: Date;
    modifiedAt?: Date;
}