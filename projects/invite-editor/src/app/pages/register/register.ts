import { NgClass } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [NgClass, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  registerForm: FormGroup;
  showPassword = signal(false);
  showPasswordConfirm = signal(false);

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
      console.log('Dados do Cadastro:', this.registerForm.value);
      // Aqui você chamaria seu serviço de API
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
