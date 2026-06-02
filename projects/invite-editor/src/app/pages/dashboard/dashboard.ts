import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';
import { AuthService, InviteService } from 'service-core';
import { environment } from 'shared-config';

export type InviteFilterStatus = 'ALL' | 'ACT' | 'EXP' | 'WAP';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, NgClass, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  readonly apiUrl = environment.baseUrlRequest;
  private readonly authService = inject(AuthService);
  private readonly inviteService = inject(InviteService);
  private readonly router = inject(Router);

  filter = signal<InviteFilterStatus>('ALL');
  search = signal('');

  invites = rxResource({
    params: () => ({}),
    stream: () =>
      this.authService.currentUser$.pipe(
        switchMap((user) => (user ? this.inviteService.getInvites(user.id) : of([])))
      ),
  });

  private readonly inviteList = computed(() => this.invites.value() ?? []);

  filteredInvites = computed(() => {
    const list = this.inviteList();
    const currentFilter = this.filter();
    const searchTerm = this.search().trim().toLowerCase();

    return list.filter((invite) => {
      if (currentFilter !== 'ALL' && invite.status !== currentFilter) {
        return false;
      }

      if (searchTerm) {
        const matchesName = invite.name?.toLowerCase().includes(searchTerm);
        const matchesId = invite.id?.toLowerCase().includes(searchTerm);
        return matchesName || matchesId;
      }

      return true;
    });
  });

  totalActive = computed(() => this.countByStatus('ACT'));
  totalExpired = computed(() => this.countByStatus('EXP'));
  totalWaitPayment = computed(() => this.countByStatus('WAP'));

  private countByStatus(status: InviteFilterStatus): number {
    return this.inviteList().filter((i) => i.status === status).length;
  }

  deleteInvite(id?: string): void {
    if (!id) return;

    const confirmed = confirm('Tem certeza que deseja excluir este convite?');
    if (!confirmed) return;

    this.inviteService.removeInvite(id).subscribe({
      next: () => this.invites.reload(), // Força atualização reativa
      error: (err) => alert(`Erro ao excluir: ${err.message || 'Tente novamente.'}`),
    });
  }

  createInvite(): void {
    this.router.navigate(['/gallery']);
  }

  editInvite(inviteId?: string): void {
    if (inviteId) {
      this.router.navigate(['/edit', inviteId], { queryParams: { mode: 'edit' } });
    }
  }

  openInvite(slug?: string): void {
    if (slug) {
      window.open(`${environment.urlInvite}/${slug}`, '_blank');
    }
  }

  viewGuestList(inviteId?: string): void {
    if (inviteId) {
      this.router.navigate(['/confirmed', inviteId]);
    }
  }

  async copyLink(slug?: string): Promise<void> {
    if (!slug) return;

    try {
      await navigator.clipboard.writeText(`${environment.urlInvite}/${slug}`);
      // Dica: Substitua por um componente de Toast do Tailwind futuramente
      alert('Link copiado com sucesso!');
    } catch {
      alert('Não foi possível copiar o link.');
    }
  }
}
