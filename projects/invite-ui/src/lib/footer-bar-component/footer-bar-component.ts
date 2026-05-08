import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-footer-bar-component',
  imports: [],
  templateUrl: './footer-bar-component.html',
  styleUrl: './footer-bar-component.css',
})
export class FooterBarComponent {
  @Input() companyName: string = 'Arthivia';
  @Input() version: string = '1.0.0';

  currentYear = new Date().getFullYear();
}
