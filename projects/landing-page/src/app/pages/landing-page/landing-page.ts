import { CommonModule, DecimalPipe, isPlatformBrowser, NgClass } from '@angular/common';
import { Component, effect, inject, Inject, PLATFORM_ID, signal } from '@angular/core';
import { InviteService } from 'service-core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from 'shared-config';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-landing-page',
  imports: [DecimalPipe, NgClass, CommonModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  private meta = inject(Meta);
  private title = inject(Title);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private inviteService = inject(InviteService);
  displayCount = signal(0);
  slogan = 'Convites fácil e rápido';
  dtEnvent = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
  });

  priceReceived = rxResource({
    stream: () => this.inviteService.getPrice(),
  });

  faq = rxResource({
    stream: () => this.inviteService.getFaqs(),
  });

  inviteAmount = rxResource({
    stream: () => this.inviteService.getInviteAmount(),
    defaultValue: 0,
  });

  openFaqIndex = signal<number | null>(0);

  toggleFaq(index: number) {
    this.openFaqIndex.set(this.openFaqIndex() === index ? null : index);
  }

  constructor() {
    this.setSeo();
    effect(() => {
      if (this.isBrowser) {
        this.animateCounter(this.inviteAmount.value());
      }
    });
  }

  private animateCounter(target: number) {
    if (isPlatformBrowser(this.platformId)) {
      requestAnimationFrame(() => {
        const duration = 1600;
        const start = performance.now();

        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);

          this.displayCount.set(Math.floor(eased * target));

          if (progress < 1) {
            requestAnimationFrame(tick);
          }
        };
        requestAnimationFrame(tick);
      });
    }
  }

  goToCreateInvite() {
    window.location.href = `${environment.urlInviteEditor}`;
  }

  entry() {
    window.location.href = `${environment.urlInviteEditor}/login`;
  }

  private setSeo() {
    const pageTitle = `Convites digitais fácil e rápido}`;
    const description = `Crie convites digitais modernos em minutos. Tema pronto, link compartilhável, confirmação de presença e contagem regressiva.`;

    const url = 'https://convitefacil.arthivia.com.br/'; // TROCAR
    const image = 'https://convitefacil.arthivia.com.br/preview.png'; // TROCAR

    this.title.setTitle(pageTitle);

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    // Open Graph (Facebook / WhatsApp / LinkedIn)
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });

    // Twitter
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
  }
}
