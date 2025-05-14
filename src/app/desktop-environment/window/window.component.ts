import {
  Component, Input, Output, EventEmitter, ViewChild,
  ViewContainerRef, OnInit, OnDestroy, ComponentRef, ElementRef, AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppInstance } from '../services/model/app-instance.model';

@Component({
  selector: 'app-window',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss']
})
export class WindowComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() appInstance!: AppInstance;
  @Output() closeRequested = new EventEmitter<string>();
  @Output() focusRequested = new EventEmitter<string>();
  @Output() minimizeRequested = new EventEmitter<string>();
  @Output() dragged = new EventEmitter<{ id: string, x: number, y: number }>();
  // @Output() resized = new EventEmitter<{ id: string, width: number, height: number }>(); // TODO: Implement resizing

  // For dynamic component injection
  @ViewChild('contentHost', { read: ViewContainerRef, static: true }) contentHost!: ViewContainerRef;
  private componentRef?: ComponentRef<any>;

  // For dragging
  isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private windowInitialX = 0;
  private windowInitialY = 0;

  constructor(private elRef: ElementRef<HTMLElement>) { }

  ngOnInit(): void {
    this.loadContentComponent();
  }

  ngAfterViewInit(): void {
    // Set initial position and size from appInstance
    this.elRef.nativeElement.style.transform = `translate(${this.appInstance.x}px, ${this.appInstance.y}px)`;
    this.elRef.nativeElement.style.width = `${this.appInstance.width}px`;
    this.elRef.nativeElement.style.height = `${this.appInstance.height}px`;
    this.elRef.nativeElement.style.zIndex = `${this.appInstance.zIndex}`;
  }


  loadContentComponent(): void {
    if (!this.appInstance || !this.appInstance.componentToRender) return;

    this.contentHost.clear();
    this.componentRef = this.contentHost.createComponent(this.appInstance.componentToRender);

    // Pass data to the dynamically created component if it has an @Input() named 'data'
    if (this.appInstance.data && this.componentRef.instance.data !== undefined) {
      this.componentRef.instance.data = this.appInstance.data;
    }
  }

  onClose(): void {
    this.closeRequested.emit(this.appInstance.id);
  }

  onFocus(): void {
    if (!this.appInstance.isActive) {
      this.focusRequested.emit(this.appInstance.id);
    }
  }

  onMinimize(): void {
    this.minimizeRequested.emit(this.appInstance.id);
  }

  // --- Basic Dragging Logic ---
  onDragStart(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('control-button')) {
      return; // Don't drag if clicking a control button
    }
    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.windowInitialX = this.appInstance.x;
    this.windowInitialY = this.appInstance.y;
    this.focusRequested.emit(this.appInstance.id); // Focus on drag start

    // Add global listeners
    document.addEventListener('mousemove', this.onDragging);
    document.addEventListener('mouseup', this.onDragEnd);
  }

  onDragging = (event: MouseEvent): void => { // Use arrow function to bind 'this'
    if (!this.isDragging) return;
    const deltaX = event.clientX - this.dragStartX;
    const deltaY = event.clientY - this.dragStartY;
    const newX = this.windowInitialX + deltaX;
    const newY = this.windowInitialY + deltaY;

    // Update visual position directly for smoothness
    this.elRef.nativeElement.style.transform = `translate(${newX}px, ${newY}px)`;
  }

  onDragEnd = (event: MouseEvent): void => { // Use arrow function to bind 'this'
    if (!this.isDragging) return;
    this.isDragging = false;

    const deltaX = event.clientX - this.dragStartX;
    const deltaY = event.clientY - this.dragStartY;
    // Emit the final position to the service
    this.dragged.emit({ id: this.appInstance.id, x: this.windowInitialX + deltaX, y: this.windowInitialY + deltaY });

    // Remove global listeners
    document.removeEventListener('mousemove', this.onDragging);
    document.removeEventListener('mouseup', this.onDragEnd);
  }

  ngOnDestroy(): void {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
    // Clean up global listeners if drag was interrupted
    document.removeEventListener('mousemove', this.onDragging);
    document.removeEventListener('mouseup', this.onDragEnd);
  }
}