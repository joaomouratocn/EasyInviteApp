import { DatePipe, isPlatformBrowser, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  PLATFORM_ID,
  signal,
  model,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { InviteModel, Theme } from 'models-core';
import { InviteService } from 'service-core';
import { LIB_CONFIG } from '../config.token';

registerLocaleData(localePt);

export interface inviteWithTheme extends InviteModel {
  theme?: Theme;
}

@Component({
  selector: 'app-invite-label',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './invite-label.html',
  styleUrl: './invite-label.css',
})
export class InviteLabel implements OnDestroy {
  // Injeções de Dependência
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly inviteService = inject(InviteService);
  protected readonly config = inject(LIB_CONFIG);

  // Mapeamento automático dos parâmetros vindos do Router do Angular
  received = input<string | null>(null); // Mapeia o parâmetro ':received' da URL
  mode = input<'new' | 'edit' | 'page'>('page'); // Mapeia o '?mode=' do QueryParam

  // MODEL ÚNICO: Centraliza o estado do convite e do tema em um só lugar
  data = model<inviteWithTheme | null>(null);

  // Estados locais de interface
  confirmModalOpen = signal<boolean>(false);
  timeLeft = signal({ days: 0, hours: 0, min: 0 });

  // Controle do Cronômetro
  private timerId: any = null;
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Computed para indicar se o componente está em modo de edição/construção prévia
  previewMode = computed(() => this.mode() === 'new' || this.mode() === 'edit');

  // Processamento de imagens dinâmicas baseado no estado unificado do `data`
  protected readonly imagesPage = computed(() => {
    const invite = this.data();
    const themeValue = invite?.theme;
    const baseUrl = this.config.baseUrlRequest;

    if (!themeValue) {
      return { profBgUrl: 'none', bgUrl: 'none', profImage: '' };
    }

    return {
      profImage: this.previewMode() ? `${invite?.profileUrl}` : `${baseUrl}${invite?.profileUrl}`,
      profBgUrl: themeValue.getBgProfImageUrl
        ? `url('${baseUrl}${themeValue.getBgProfImageUrl}')`
        : 'none',
      bgUrl: themeValue.bgImageUrl ? `url('${baseUrl}${themeValue.bgImageUrl}')` : 'none',
    };
  });

  // Mapeamento dinâmico de cores (Light / Dark Mode) extraído do tema acoplado
  schema = computed(() => {
    const invite = this.data();
    const theme = invite?.theme;
    return invite?.darkMode ? theme?.darkTheme : theme?.lightTheme;
  });

  constructor() {
    // Efeito de Roteamento: Decide qual API chamar dependendo dos parâmetros da URL
    effect(() => {
      const valorRecebido = this.received();
      const modoAtual = this.mode();

      if (!valorRecebido) return;

      if (modoAtual === 'new') {
        // Se o modo for 'new', o parâmetro recebido é obrigatoriamente o ID do Tema
        this.loadNewInviteFromTheme(valorRecebido);
      } else {
        // Nos modos 'edit' ou 'page', o parâmetro recebido é o ID do próprio Convite
        this.loadExistingInvite(valorRecebido);
      }
    });

    // Efeito reativo para atualização de metatags de SEO
    effect(() => {
      const invite = this.data();
      if (invite && invite.theme) {
        this.updateSeo(invite, invite.theme);
      }
    });

    // Efeito para ciclo de vida do Timer regressivo
    effect((onCleanup) => {
      const invite = this.data();
      if (invite?.eventDate && this.isBrowser) {
        this.startTimer(invite.eventDate);
        onCleanup(() => this.clearTimer());
      }
    });
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  /**
   * CENÁRIO: Carregar convite já existente (?mode=edit ou ?mode=page)
   */
  private loadExistingInvite(inviteId: string): void {
    this.inviteService.getInviteById(inviteId).subscribe({
      next: (invite: inviteWithTheme) => {
        if (invite.theme) {
          this.data.set(invite);
        } else if (invite.themeId) {
          // Se o convite não trouxer o objeto tema aninhado, busca na API e anexa
          this.inviteService.getThemeById(invite.themeId).subscribe({
            next: (themeData) => {
              this.data.set({ ...invite, theme: themeData });
            },
            error: () => this.data.set(invite)
          });
        } else {
          this.data.set(invite);
        }
      }
    });
  }

  /**
   * CENÁRIO: Criar estrutura inicial do convite a partir do tema (?mode=new)
   */
  private loadNewInviteFromTheme(themeId: string): void {
    this.inviteService.getThemeById(themeId).subscribe({
      next: (themeData) => {
        const mockNewInvite: inviteWithTheme = {
          id: '',
          name: 'Nome do Aniversariante',
          slug:'',
          age: 0,
          eventDate: new Date(Date.now() + 86400000 * 7).toISOString(), // Padrão: 7 dias no futuro
          address: 'Endereço do Evento',
          mapUrl: '',
          description: ['Seu primeiro recado!'],
          showAge: true,
          enableTimer: true,
          confirmEnable: true,
          profileUrl: '',
          darkMode: false,
          themeId: themeId,
          theme: themeData,
          status: 'WAP',
          createdAt: new Date().toISOString(),
        };

        // Alimenta o model. O componente pai passa a ter acesso imediato a este objeto
        this.data.set(mockNewInvite);
      }
    });
  }

  private updateSeo(invite: inviteWithTheme, theme: any): void {
    const name = invite.name || '';
    const subtitle = theme.subtitle || '';

    this.title.setTitle(`Convite de Aniversário - ${name}`);

    this.meta.updateTag({ property: 'og:title', content: `Aniversário do(a) ${name}` });
    this.meta.updateTag({ property: 'og:image', content: theme.getBgProfImageUrl || '' });
    this.meta.updateTag({ property: 'og:description', content: subtitle });
    this.meta.updateTag({ name: 'description', content: subtitle });
  }

  private startTimer(targetDate: string): void {
    this.clearTimer();

    const eventDate = new Date(targetDate).getTime();
    if (isNaN(eventDate)) return;

    this.updateTimeLeft(eventDate);
    this.timerId = setInterval(() => this.updateTimeLeft(eventDate), 1000);
  }

  private updateTimeLeft(eventDate: number): void {
    const diff = eventDate - Date.now();

    if (diff <= 0) {
      this.timeLeft.set({ days: 0, hours: 0, min: 0 });
      this.clearTimer();
      return;
    }

    this.timeLeft.set({
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      min: Math.floor((diff % 3600000) / 60000),
    });
  }

  private clearTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  closeConfirmModal(): void {
    this.confirmModalOpen.set(false);
  }

  openConfirmModal(): void {
    this.confirmModalOpen.set(true);
  }

  confirmPresence(form: NgForm): void {
    if (form.invalid) return;
    this.confirmModalOpen.set(true);
    form.resetForm();
  }
}