import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'service-core';

declare const google: any;

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  private authService = inject(AuthService);
  showPassword = false;

  ngOnInit(): void {
    google.accounts.id.initialize({
      client_id: '370415873876-ocdod6anb1833eb8q7n45dt49bj0d9pe.apps.googleusercontent.com',
      callback: (response: any) => {
        this.authService.setUser(response);
      },
    });

    google.accounts.id.renderButton(document.getElementById('google-button'), {
      theme: 'outline',
      size: 'large',
      width: 200,
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
