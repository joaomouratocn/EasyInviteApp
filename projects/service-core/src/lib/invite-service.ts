import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable} from 'rxjs';
import { InviteModel, Theme, Faq, PriceDto, InviteModelWithTheme } from 'models-core';

@Injectable({
  providedIn: 'root',
})
export class InviteService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api';

saveInvite(invite: InviteModel, profileFile: File | null): Observable<string> {
  const formData = new FormData();

  if (invite.userId) {
    formData.append('userId', invite.userId);
  }
  
  formData.append('name', invite.name);
  formData.append('age', invite.age.toString());
  formData.append('eventDate', invite.eventDate);
  formData.append('address', invite.address);
  
  if (invite.mapUrl) {
    formData.append('mapUrl', invite.mapUrl);
  }

  if (invite.description && invite.description.length > 0) {
    invite.description.forEach(desc => formData.append('description', desc));
  }

  formData.append('showAge', String(invite.showAge));
  formData.append('enableTimer', String(invite.enableTimer));
  formData.append('confirmEnable', String(invite.confirmEnable));
  formData.append('darkMode', String(invite.darkMode));
  formData.append('themeId', invite.themeId);

  if (profileFile) {
    formData.append('profileFile', profileFile, profileFile.name);
  }

  return this.http.post<string>(`${this.API_URL}/invites/save`, formData, {
    withCredentials: true,
  });
}


  getInvite(slug: String): Observable<InviteModel> {
    return this.http.get<InviteModel>(`${this.API_URL}/invites/${slug}`);
  }

  getInviteById(inviteId: String): Observable<InviteModel> {
    return this.http.get<InviteModel>(`${this.API_URL}/invites/id/${inviteId}`);
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

  getInvites(userId: string): Observable<InviteModelWithTheme[]> {
    const result =  this.http.get<InviteModelWithTheme[]>(`${this.API_URL}/invites/user/${userId}`);
    return result;
  }

  getInviteAmount(): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/invites/count`);
  }

  getPrice(): Observable<PriceDto> {
    return this.http.get<PriceDto>(`${this.API_URL}/price/current`);
  }

  removeInvite(inviteId: string): Observable<string> {
    return this.http.delete<string>(`${this.API_URL}/invites/${inviteId}}`);
  }
}
