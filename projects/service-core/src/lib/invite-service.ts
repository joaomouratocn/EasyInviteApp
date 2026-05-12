import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { InviteModel, Theme, Faq } from 'models-core';

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
    return this.http.get<Theme[]>(`${this.API_URL}/themes`);
  }

  getThemeById(id: string): Observable<Theme> {
    return this.http.get<Theme>(`${this.API_URL}/themes/${id}`);
  }

  getFaqs(): Observable<Faq[]> {
    return this.http.get<Faq[]>(`${this.API_URL}/faqs/getall`);
  }

  getInvites(): Observable<InviteModel[]> {
    return this.http.get<InviteModel[]>(`${this.API_URL}/invites`);
  }

  getInviteAmount(): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/invite/count`);
  }

  getPrice(): Observable<number> {
    return of(23.99);
  }

  removeInvite(inviteId: string): Observable<string> {
    return this.http.delete<string>(`${this.API_URL}/invites/${inviteId}}`);
  }
}
