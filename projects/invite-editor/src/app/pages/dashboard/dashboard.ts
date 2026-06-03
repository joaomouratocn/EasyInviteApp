import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, switchMap, take } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';
import { AuthService, InviteService } from 'service-core';
import { InviteModel } from 'models-core';
import { environment } from 'shared-config';

export type InviteFilterStatus = 'ALL' | 'ACT' | 'EXP' | 'WAP';

type SavedInviteDraft = InviteModel & {
  profileFileDataUrl?: string | null;
  profileFileName?: string | null;
  profileFileType?: string | null;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, NgClass, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
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

  ngOnInit(): void {
    this.authService.currentUser$.pipe(take(1)).subscribe((user) => {
      if (!user) {
        return;
      }

      const draft = this.loadSavedInviteDraft();
      if (!draft) {
        return;
      }

      this.sendDraftToApi(draft, user.id);
    });
  }

  private loadSavedInviteDraft(): SavedInviteDraft | null {
    const raw = sessionStorage.getItem('inviteDraft');
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as SavedInviteDraft;
    } catch {
      sessionStorage.removeItem('inviteDraft');
      return null;
    }
  }

  private clearSavedInviteDraft(): void {
    sessionStorage.removeItem('inviteDraft');
  }

  private createFileFromDraft(draft: SavedInviteDraft): File | null {
    if (!draft.profileFileDataUrl || !draft.profileFileName) {
      return null;
    }

    const [meta, base64] = draft.profileFileDataUrl.split(',');
    const mimeMatch = meta.match(/data:(.*?);base64/);
    const mime = mimeMatch ? mimeMatch[1] : draft.profileFileType ?? 'image/jpeg';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new File([bytes], draft.profileFileName, { type: mime });
  }

  private sendDraftToApi(draft: SavedInviteDraft, userId: string): void {
    const file = this.createFileFromDraft(draft);
    const payload: InviteModel = {
      ...draft,
      userId,
      profileUrl: draft.profileUrl ?? null,
      themeId: draft.themeId ?? '',
      status: draft.status ?? 'ACT',
      createdAt: draft.createdAt ?? new Date().toISOString(),
    };

    console.log('Enviando draft salvo para API no login', payload, file);

    this.inviteService.saveInvite(payload, file).subscribe({
      next: (result) => {
        this.clearSavedInviteDraft();
        this.invites.reload();
        console.log('Draft enviado para API no login', result);
      },
      error: (err) => {
        console.error('Falha ao enviar draft salvo no dashboard:', err);
      },
    });
  }

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
      this.router.navigate(['/', inviteId], { queryParams: { mode: 'edit' } });
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
