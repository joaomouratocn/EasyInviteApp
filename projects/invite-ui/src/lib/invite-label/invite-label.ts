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
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { InviteModel } from 'models-core';
import { of } from 'rxjs';
import { InviteService } from 'service-core';
import { LIB_CONFIG } from '../config.token';

registerLocaleData(localePt);

@Component({
  selector: 'app-invite-label',
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

  // Inputs e Signals
  received = input.required<string | InviteModel>();
  previewMode = input<boolean>(false);
  confirmModalOpen = signal<boolean>(false);
  timeLeft = signal({ days: 0, hours: 0, min: 0 });

  // Controle de Timer
  private timerId: any = null;
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Recursos Reativos (rxResource)
  readonly data = rxResource({
    params: () => this.received(),
    stream: ({ params }) =>
      typeof params === 'string' ? this.inviteService.getInvite(params) : of(params),
  });

  readonly theme = rxResource({
    params: () => this.data.value()?.themeId,
    stream: ({ params }) => (params ? this.inviteService.getThemeById(params) : of(undefined)),
  });

  // Computeds
  protected readonly imagesPage = computed(() => {
    const data = this.data.value();
    const themeValue = this.theme.value();
    const baseUrl = this.config.baseUrlRequest;

    if (!themeValue) {
      return { profBgUrl: 'none', bgUrl: 'none' };
    }

    return {
      profImage: `${baseUrl}${data?.profileUrl}`,
      profBgUrl: themeValue.getBgProfImageUrl
        ? `url('${baseUrl}${themeValue.getBgProfImageUrl}')`
        : 'none',
      bgUrl: themeValue.bgImageUrl ? `url('${baseUrl}${themeValue.bgImageUrl}')` : 'none',
    };
  });

  schema = computed(() => {
    const invite = this.data.value();
    const theme = this.theme.value();
    return invite?.darkMode ? theme?.darkTheme : theme?.lightTheme;
  });

  constructor() {
    // Efeito Unificado para SEO (Evita múltiplos gatilhos desnecessários)
    effect(() => {
      const invite = this.data.value();
      const theme = this.theme.value();
      if (invite && theme) {
        this.updateSeo(invite, theme);
      }
    });

    // Efeito para o Timer
    effect((onCleanup) => {
      const invite = this.data.value();
      if (invite?.eventDate && this.isBrowser) {
        this.startTimer(invite.eventDate);
        onCleanup(() => this.clearTimer());
      }
    });
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  private updateSeo(invite: InviteModel, theme: any): void {
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

    // Executa a primeira vez imediatamente para evitar delay de 1 segundo na tela
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
      days: Math.floor(diff / 86400000), // 1000 * 60 * 60 * 24
      hours: Math.floor((diff % 86400000) / 3600000), // 1000 * 60 * 60
      min: Math.floor((diff % 3600000) / 60000), // 1000 * 60
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
