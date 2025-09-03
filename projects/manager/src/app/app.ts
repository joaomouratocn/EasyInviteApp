import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterBarComponent, TopbarBarComponent } from 'invite-ui';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterBarComponent, TopbarBarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('manager');
}
