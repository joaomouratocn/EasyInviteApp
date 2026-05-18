import { Component, computed, inject, signal } from '@angular/core';
import { InviteModel } from 'models-core';
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { InviteService } from 'service-core';
import { environment } from '../../../environment/environment.pdod';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, NgClass, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  readonly apiUrl = environment.imagesUrlApi;
  private inviteService = inject(InviteService);
  private router = inject(Router);

  filter = signal<'ALL' | 'ACT' | 'EXP' | 'WAP'>('ALL');
  search = signal('');

  invites = rxResource({
    params: () => this.inviteService,
    stream: ({ params }) => {
      return params.getInvites();
    },
  });

  filteredInvites = computed(() => {
    // O computed "escuta" automaticamente estes 3 sinais:
    let list = this.invites.value() || [];
    const currentFilter = this.filter();
    const searchTerm = this.search().toLowerCase().trim();

    // Aplica o filtro de status
    if (currentFilter === 'ACT') {
      list = list.filter((i) => i.status);
    } else if (currentFilter === 'EXP') {
      list = list.filter((i) => !i.status);
    } else if (currentFilter === 'WAP') {
      list = list.filter((i) => !i.status);
    }

    // Aplica a busca por texto
    if (searchTerm) {
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(searchTerm) || i.themeId.toLowerCase().includes(searchTerm),
      );
    }

    return list;
  });

  totalActive = computed(
    () => (this.invites.value() || []).filter((i) => i.status === 'ACT').length,
  );

  totalExpired = computed(
    () => (this.invites.value() || []).filter((i) => i.status === 'EXP').length,
  );

  totalWaitPayment = computed(
    () => (this.invites.value() || []).filter((i) => i.status === 'WAP').length,
  );

  deleteInvite(id?: string) {
    if (id) {
      const confirmed = confirm('Tem certeza que deseja excluir este convite?');
      if (!confirmed) return;

      this.inviteService.removeInvite(id).subscribe({
        next: () => {
          // Força o rxResource a buscar a lista atualizada do servidor
          this.invites.reload();
        },
        error: (err) => alert('Erro ao excluir: ' + err.message),
      });
    }
  }

  createInvite() {
    this.router.navigate(['/gallery']);
  }

  editInvite(ivniteId?: string) {
    if (ivniteId) {
      this.router.navigate(['/edit', ivniteId], { queryParams: { mode: 'edit' } });
    }
  }

  openInvite(slug?: string) {
    if (slug) {
      window.location.href = `${environment.urlInvite}/${slug}`;
    }
  }

  viewGuestList(ivniteId?: string) {
    if (ivniteId) {
      this.router.navigate(['/confirmed', ivniteId]);
    }
  }

  async copyLink(slug?: string) {
    if (slug) {
      await navigator.clipboard.writeText(`${environment.urlInvite}/${slug}`);
      alert('Link copiado!');
    }
  }
}
