import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from 'service-core';
import { environment } from 'shared-config';

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
      client_id: environment.googleClientId,
      callback: (response: any) => {
        this.authService.loginUser(response);
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
