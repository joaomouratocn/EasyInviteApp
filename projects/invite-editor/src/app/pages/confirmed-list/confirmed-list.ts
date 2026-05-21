import { Component, computed, input, signal, viewChild, ElementRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Guest } from 'models-core';
import { jsPDF } from 'jspdf'; // Instale se for usar: npm install jspdf

@Component({
  selector: 'app-confirmed-list',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './confirmed-list.html',
  styleUrl: './confirmed-list.css',
})
export class ConfirmedList {
  inviteId = input.required<string>();

  // Elemento da lista para controle de scroll
  private listContainer = viewChild<ElementRef<HTMLDivElement>>('listContainer');

  guests = signal<Guest[]>([
    { id: '1', name: 'João Silva', date: new Date() },
    { id: '2', name: 'Maria Souza', date: new Date() },
  ]);

  // Alterado para strings normais para funcionar perfeitamente com [(ngModel)] do Angular
  newGuestName = '';
  searchTerm = '';

  filteredGuests = computed(() => {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.guests();
    return this.guests().filter((g) => g.name.toLowerCase().includes(term));
  });

  addGuest() {
    const nameTrimmed = this.newGuestName.trim();
    if (!nameTrimmed) return;

    // Capitaliza a primeira letra de cada palavra de forma robusta
    const formattedName = nameTrimmed
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    const newGuest: Guest = {
      id: crypto.randomUUID(),
      name: formattedName,
      date: new Date(),
    };

    // Adiciona ao topo e limpa o input
    this.guests.update((prev) => [newGuest, ...prev]);
    this.newGuestName = '';

    // Scroll suave para o topo da lista para ver o novo convidado
    setTimeout(() => {
      this.listContainer()?.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  }

  removeGuest(id?: string) {
    if (!id) return;
    this.guests.update((prev) => prev.filter((g) => g.id !== id));
  }

  exportToPDF() {
    const doc = new jsPDF();
    doc.text('Lista de Convidados Confirmados', 10, 10);

    this.guests().forEach((guest, index) => {
      const dateStr = new Date(guest.date).toLocaleDateString('pt-BR');
      doc.text(`${index + 1}. ${guest.name} (Confirmado em: ${dateStr})`, 10, 20 + index * 10);
    });

    doc.save(`convidados-${this.inviteId()}.pdf`);
  }
}
