import { Component } from '@angular/core';
import { CommonModule } from "@angular/common";
import { DesktopComponent } from "../desktop/desktop.component";
import { DETaskbarComponent } from "../taskbar/taskbar.component";

@Component({
  selector: 'app-desktop-environment',
  imports: [CommonModule, DesktopComponent, DETaskbarComponent],
  templateUrl: './desktop-environment.component.html',
  styleUrl: './desktop-environment.component.scss'
})
export class DesktopEnvironmentComponent {

}
