import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { rxResource } from '@angular/core/rxjs-interop';
import { InviteModel } from 'models-core';
import { map, of } from 'rxjs';
import { InviteService } from 'service-core';
import localePt from '@angular/common/locales/pt';
import { registerLocaleData, isPlatformBrowser } from '@angular/common';
registerLocaleData(localePt);

@Component({
  selector: 'app-invite-label',
  imports: [DatePipe, FormsModule],
  templateUrl: './invite-label.html',
  styleUrl: './invite-label.css',
})
export class InviteLabel {
  private meta = inject(Meta);
  private title = inject(Title);
  private platformId = inject(PLATFORM_ID);
  private inviteService = inject(InviteService);
  private timerId: any;

  received = input.required<string | InviteModel>();

  previewMode = input<boolean>(false);
  confirmModalOpen = signal(false);
  timeLeft = signal({ days: 0, hours: 0, min: 0 });

  data = rxResource({
    params: () => this.received(),
    stream: ({ params }) => {
      if (typeof params === 'string') {
        return this.inviteService.getInvite(params);
      }
      return of(params);
    },
  });

  theme = rxResource({
    params: () => this.data.value()?.theme,
    stream: ({ params }) => {
      if (!params) return of(undefined); // Evita chamadas desnecessárias
      return this.inviteService.getThemeById(params);
    },
  });

  schema = computed(() => {
    return this.data.value()?.darkMode ? this.theme.value()?.dark : this.theme.value()?.light;
  });

  constructor() {
    // Efeito para SEO
    effect(() => {
      const invite = this.data.value();
      const theme = this.theme.value();
      if (invite && theme) {
        this.updateSeo(invite);
      }
    });

    // Efeito para o Timer
    effect((onCleanup) => {
      const invite = this.data.value();
      if (invite?.date && isPlatformBrowser(this.platformId)) {
        this.startTimer(invite.date);
        onCleanup(() => this.timerId && clearInterval(this.timerId));
      }
    });
  }

  updateSeo(invite: InviteModel) {
    this.title.setTitle(`Convite de Aniversário - ${this.data.value()?.name}`);

    this.meta.updateTag({
      property: 'og:title',
      content: `Aniversário do(a) ${this.data.value()?.name}`,
    });
    this.meta.updateTag({ property: 'og:image', content: this.theme.value()?.bgProfImage || '' });
    this.meta.updateTag({
      property: 'og:description',
      content: this.theme.value()?.subtitle || '',
    });
    this.meta.updateTag({ name: 'description', content: this.theme.value()?.subtitle || '' });
  }

  startTimer(targetDate: string) {
    if (this.timerId) {
      clearInterval(this.timerId);
    }

    const eventDate = new Date(targetDate).getTime();

    this.timerId = setInterval(() => {
      const now = new Date().getTime();
      const diff = eventDate - now;

      if (diff <= 0) {
        this.timeLeft.set({ days: 0, hours: 0, min: 0 });
        clearInterval(this.timerId);
        return;
      }

      this.timeLeft.set({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        min: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      });
    }, 1000);
  }

  closeConfirmModal() {
    this.confirmModalOpen.set(false);
  }

  openConfirmModal() {
    this.confirmModalOpen.set(true);
  }

  confirmPresence(form: NgForm) {
    if (form.invalid) return;
    this.confirmModalOpen.set(true);
    form.resetForm();
  }
}
