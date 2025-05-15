import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subscription } from 'rxjs';
import { switchMap, catchError, map, tap } from 'rxjs/operators';
import { MarkdownModule, MarkdownService } from 'ngx-markdown'; // Import MarkdownService

import { FileSystemService } from '../../desktop-environment/services/file-system.service';
import { FSObject } from '../../desktop-environment/services/model/fs-object.model';
// No DesktopManagerService needed here for now, unless we want to change window title dynamically

@Component({
  selector: 'app-text-pad-app',
  standalone: true,
  imports: [CommonModule, MarkdownModule],
  templateUrl: './text-pad-app.component.html',
  styleUrls: ['./text-pad-app.component.scss']
})
export class TextPadAppComponent implements OnInit, OnDestroy {
  @Input() data?: { fileId?: string; fileName?: string; initialContent?: string };

  fileContent: string | null = null;
  isLoading = false;
  errorLoading: string | null = null;
  isMarkdown = false;
  currentFileName: string = 'Untitled';

  private fsObjectSubscription: Subscription | undefined;

  constructor(
    private http: HttpClient,
    private fileSystem: FileSystemService,
    private markdownService: MarkdownService // Inject MarkdownService for potential options
  ) {
    // Optional: Configure ngx-markdown if needed
    // this.markdownService.options = { ... };
  }

  ngOnInit(): void {
    if (this.data?.fileId) {
      this.currentFileName = this.data.fileName || 'Document';
      this.loadFileContent(this.data.fileId);
    } else if (this.data?.initialContent !== undefined) {
      this.fileContent = this.data.initialContent;
      this.currentFileName = this.data.fileName || 'Untitled';
      this.isMarkdown = this.currentFileName.toLowerCase().endsWith('.md');
    } else {
      this.fileContent = ''; // New, empty document
      this.currentFileName = 'Untitled.txt';
      this.isMarkdown = false;
    }
  }

  private loadFileContent(fileId: string): void {
    this.isLoading = true;
    this.errorLoading = null;
    this.fileContent = null;

    this.fsObjectSubscription = this.fileSystem.getObjectById(fileId).pipe(
      switchMap((fsObject: FSObject | undefined) => {
        if (!fsObject) {
          throw new Error(`File with ID "${fileId}" not found.`);
        }

        this.isMarkdown = fsObject.fileType === 'md';
        // this.currentFileName = fsObject.name; // Already set from input data ideally

        if (fsObject.contentPath) {
          return this.http.get(fsObject.contentPath, { responseType: 'text' });
        } else if (fsObject.content !== undefined && fsObject.content !== null) {
          return of(String(fsObject.content));
        } else {
          return of(''); // Treat as empty if no content/path
        }
      }),
      catchError(err => {
        console.error('Error loading file content:', err);
        this.errorLoading = `Could not load file: ${this.currentFileName}.`;
        return of(''); // Show empty content on error
      })
    ).subscribe(content => {
      this.isLoading = false;
      this.fileContent = content;
    });
  }

  ngOnDestroy(): void {
    if (this.fsObjectSubscription) {
      this.fsObjectSubscription.unsubscribe();
    }
  }
}