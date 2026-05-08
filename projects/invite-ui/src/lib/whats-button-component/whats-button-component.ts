import { Component, input } from '@angular/core';

@Component({
  selector: 'lib-whats-button-component',
  imports: [],
  templateUrl: './whats-button-component.html',
  styleUrl: './whats-button-component.css',
})
export class WhatsButtonComponent {
  phone = input.required<string>(); // Ex: 5541999999999
  message = input<string>('Olá! Estou com algumas dúvidas'); // Mensagem padrão opcional
}
