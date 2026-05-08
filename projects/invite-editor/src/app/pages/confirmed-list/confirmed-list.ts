import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Guest } from 'models-core';

@Component({
  selector: 'app-confirmed-list',
  imports: [FormsModule, DatePipe],
  templateUrl: './confirmed-list.html',
  styleUrl: './confirmed-list.css',
})
export class ConfirmedList {
  // Recebe o ID do convite (ex: vindo da rota ou input do pai)
  inviteId = input.required<string>();

  // Estado da lista (usando Signals)
  guests = signal<Guest[]>([
    { id: '1', name: 'João Silva', date: new Date() },
    { id: '2', name: 'Maria Souza', date: new Date() },
  ]);

  newGuestName = signal('');
  searchTerm = signal('');

  // Lista filtrada automaticamente
  filteredGuests = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.guests().filter((g) => g.name.toLowerCase().includes(term));
  });

  addGuest() {
    if (!this.newGuestName().trim()) return;
    const name = this.newGuestName().charAt(0).toUpperCase() + this.newGuestName().slice(1);
    const newGuest: Guest = {
      id: crypto.randomUUID(),
      name: name,
      date: new Date(),
    };

    this.guests.update((prev) => [newGuest, ...prev]);
    this.newGuestName.set('');
  }

  removeGuest(id?: string) {
    if (id) {
      this.guests.update((prev) => prev.filter((g) => g.id !== id));
    }
  }

  exportToPDF() {}
}
