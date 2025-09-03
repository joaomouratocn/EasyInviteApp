import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-insert-theme',
  imports: [ReactiveFormsModule],
  templateUrl: './insert-theme.html',
  styleUrl: './insert-theme.css',
})
export class InsertTheme {
  themeForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.themeForm = this.fb.group({
      id: ['', [Validators.required, Validators.maxLength(50)]],
      theme_name: ['', [Validators.required, Validators.maxLength(100)]],
      title: ['', Validators.maxLength(255)],
      subtitle: ['', Validators.maxLength(255)],
      modal_title: ['', Validators.maxLength(255)],
      confirm_text: [''],
      cover_url: [''],
      bg_image_url: [''],
      bg_prof_image_url: [''],
      // Passando nosso validador customizado de JSON estrutural
      light_theme: ['', [Validators.required, this.jsonValidator]],
      dark_theme: ['', [Validators.required, this.jsonValidator]],
    });
  }

  // Validador Customizado para garantir a integridade do JSONB antes do envio
  jsonValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    try {
      JSON.parse(control.value);
      return null;
    } catch (e) {
      return { jsonInvalido: true };
    }
  }

  onSubmit(): void {
    if (this.themeForm.valid) {
      const formValue = { ...this.themeForm.value };

      // Converte as strings das textareas de volta para objetos JSON antes de enviar ao Back-end (Spring Boot)
      formValue.light_theme = JSON.parse(formValue.light_theme);
      formValue.dark_theme = JSON.parse(formValue.dark_theme);

      console.log('Payload pronto para o banco de dados (PostgreSQL):', formValue);
      // Aqui você injetaria seu serviço HTTP para salvar os dados
    }
  }
}
