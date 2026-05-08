import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { FooterBarComponent, TopbarBarComponent } from 'invite-ui';
import { AuthService } from 'service-core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterBarComponent, TopbarBarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('invite-editor');
}
