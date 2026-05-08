import { NgClass } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, NgClass, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  forgotForm: FormGroup;
  isSent = signal(false); // Estado para mostrar mensagem de sucesso
  isLoading = signal(false);

  constructor(private fb: FormBuilder) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.forgotForm.valid) {
      this.isLoading.set(true);

      // Simulação de envio de e-mail
      setTimeout(() => {
        console.log('E-mail de recuperação enviado para:', this.forgotForm.value.email);
        this.isLoading.set(false);
        this.isSent.set(true);
      }, 1500);
    } else {
      this.forgotForm.markAllAsTouched();
    }
  }
}
