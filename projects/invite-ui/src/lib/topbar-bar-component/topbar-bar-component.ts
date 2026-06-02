import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService } from 'service-core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'lib-topbar-bar-component',
  imports: [CommonModule, RouterModule],
  templateUrl: './topbar-bar-component.html',
  styleUrl: './topbar-bar-component.css',
})
export class TopbarBarComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  user$ = this.authService.currentUser$;

  home() {
    this.router.navigate(['/dashboard']);
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
          this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout failed', err);
      },
    });
  }
}
