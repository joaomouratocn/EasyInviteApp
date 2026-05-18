import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Theme } from 'models-core';
import { InviteService } from 'service-core';
import { WhatsButtonComponent } from 'invite-ui';
import { environment } from '../../../environment/environment.pdod';

@Component({
  selector: 'app-theme-gallery',
  imports: [CommonModule, RouterModule, WhatsButtonComponent],
  templateUrl: './theme-gallery.html',
  styleUrl: './theme-gallery.css',
})
export class ThemeGallery {
  readonly baseBucketUrl = environment.imagesUrlApi; 
  private inviteService = inject(InviteService);

  themes = signal<Theme[]>([]);

  ngOnInit() {
    this.inviteService.getThemes().subscribe({
      next: (data) => {
        console.log(`${this.baseBucketUrl}+${data[0].getCoverUrl}`)
        this.themes.set(data)
      },
      error: (err) => console.error(err),
    });
  }
}
