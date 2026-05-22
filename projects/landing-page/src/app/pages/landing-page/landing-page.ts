import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router'; // Adicionado para navegação SPA segura
import { InviteService } from 'service-core';
import { environment } from 'shared-config';

@Component({
  selector: 'app-landing-page',
  imports: [DecimalPipe, CommonModule], // Removido NgClass (CommonModule já o inclui)
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  // Injeções de Dependência
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly router = inject(Router);
  private readonly inviteService = inject(InviteService);
  private readonly platformId = inject(PLATFORM_ID);

  // Sinais e Propriedades
  protected readonly isBrowser = isPlatformBrowser(this.platformId);
  protected readonly displayCount = signal<number>(0);
  protected readonly openFaqIndex = signal<number | null>(0);

  protected readonly slogan = 'Convites fáceis e rápidos';
  protected readonly dtEvent = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
  });

  // Recursos Reativos (rxResource)
  protected readonly priceReceived = rxResource({
    stream: () => this.inviteService.getPrice(),
  });

  protected readonly faq = rxResource({
    stream: () => this.inviteService.getFaqs(),
  });

  protected readonly inviteAmount = rxResource({
    stream: () => this.inviteService.getInviteAmount(),
    defaultValue: 0,
  });

  constructor() {
    this.setSeo();

    // Efeito para animação do contador reativo
    effect(() => {
      const amount = this.inviteAmount.value();
      if (this.isBrowser && amount > 0) {
        this.animateCounter(amount);
      }
    });
  }

  protected toggleFaq(index: number): void {
    this.openFaqIndex.update((current) => (current === index ? null : index));
  }

  private animateCounter(target: number): void {
    const duration = 1600;
    let startTimestamp: number | null = null;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      // Easing function: Cubic Out
      const eased = 1 - Math.pow(1 - progress, 3);
      this.displayCount.set(Math.floor(eased * target));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }

  protected goToCreateInvite(): void {
    this.navigateToUrl(`${environment.urlInviteEditor}/gallery`);
  }

  protected entry(): void {
    this.navigateToUrl(`${environment.urlInviteEditor}`);
  }

  private navigateToUrl(url: string): void {
    if (!this.isBrowser) return;

    // Se o editor estiver no mesmo domínio, usa o Router do Angular para não recarregar a página
    if (url.startsWith('/') || url.startsWith(window.location.origin)) {
      const path = url.replace(window.location.origin, '');
      this.router.navigateByUrl(path);
    } else {
      window.location.href = url;
    }
  }

  private setSeo(): void {
    const pageTitle = 'Convites digitais fáceis e rápidos';
    const description =
      'Crie convites digitais modernos em minutos. Tema pronto, link compartilhável, confirmação de presença e contagem regressiva.';

    const url = 'https://convitefacil.arthivia.com.br/';
    const image = 'https://convitefacil.arthivia.com.br/preview.png';

    this.title.setTitle(pageTitle);

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    // Open Graph
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
