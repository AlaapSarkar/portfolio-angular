import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'application-test',
  imports: [CommonModule],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestApplicationComponent {
  @Input() data: any; // To receive data from appInstance
}
