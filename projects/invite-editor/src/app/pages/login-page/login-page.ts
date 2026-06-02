import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from 'service-core';
import { environment } from 'shared-config';

declare const google: any;

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  private authService = inject(AuthService);
  private router = inject(Router);
  showPassword = false;
  isLoading = signal(false);
  isGoogleLoading = signal(false);
  loginForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.nonNullable.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
      },
    );
  }

  ngOnInit(): void {
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => {
        this.isGoogleLoading.set(true);
        this.authService.googleAuth(response.credential).subscribe({
          next: () => this.router.navigate(['/dashboard']),
          error: (err) => {
            console.error('Google login failed', err);
            this.isGoogleLoading.set(false);
          },
        });
      },
    });

    google.accounts.id.renderButton(document.getElementById('google-button'), {
      theme: 'outline',
      size: 'large',
      width: 200,
    });
  }

  loginApp(){
    if(this.loginForm.valid){
      this.isLoading.set(true);
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Login failed', err);
          this.isLoading.set(false);
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
