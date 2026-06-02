import { NgClass } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'service-core';

@Component({
  selector: 'app-register',
  imports: [NgClass, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private router = inject(Router);
  private authService = inject(AuthService);

  registerForm: FormGroup;
  showPassword = signal(false);
  showPasswordConfirm = signal(false);
  isLoading = signal(false);

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.nonNullable.group(
      {
        fullName: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        newsletter: [false],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  // Validador customizado para comparar as senhas
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    return password && confirmPassword && password.value !== confirmPassword.value
      ? { passwordMismatch: true }
      : null;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      console.log('Dados do Cadastro:', this.registerForm.value);
      const newUser = {
        email: this.registerForm.value.email,
        name: this.registerForm.value.fullName,
        password: this.registerForm.value.password,
        sendNewsletter: this.registerForm.value.newsletter,
      };
      this.authService.register(newUser).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Erro ao registrar usuário:', err);
          this.isLoading.set(false);
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  togglePassword() {
    this.showPassword.update((v) => !v);
  }

  togglePasswordConfirm() {
    this.showPasswordConfirm.update((v) => !v);
  }
}
