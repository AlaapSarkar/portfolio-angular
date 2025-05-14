import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DesktopEnvironmentComponent } from "./desktop-environment/desktop-environment/desktop-environment.component";

@Component({
  selector: 'app-root',
  imports: [DesktopEnvironmentComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'portfolio-angular';
}
