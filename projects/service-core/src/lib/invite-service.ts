import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { InviteModel, Theme, Faq, PriceDto } from 'models-core';

@Injectable({
  providedIn: 'root',
})
export class InviteService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api';

  saveInvite(invitation: InviteModel): Observable<true> {
    return of(true);
  }

  getInvite(slug: String): Observable<InviteModel> {
    return this.http.get<InviteModel>(`${this.API_URL}/invites/${slug}`);
  }

  getThemes(): Observable<Theme[]> {
    return this.http.get<Theme[]>(`${this.API_URL}/themes/getall`);
  }

  getThemeById(themeId: string): Observable<Theme> {
    return this.http.get<Theme>(`${this.API_URL}/themes/${themeId}`);
  }

  getFaqs(): Observable<Faq[]> {
    return this.http.get<Faq[]>(`${this.API_URL}/faqs/getall`);
  }

  getInvites(): Observable<InviteModel[]> {
    return this.http.get<InviteModel[]>(`${this.API_URL}/invites`);
  }

  getInviteAmount(): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/invites/count`);
  }

  getPrice(): Observable<PriceDto> {
    return this.http.get<PriceDto>(`${this.API_URL}/price`);
  }

  removeInvite(inviteId: string): Observable<string> {
    return this.http.delete<string>(`${this.API_URL}/invites/${inviteId}}`);
  }
}
