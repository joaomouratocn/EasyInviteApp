import { Theme } from './theme-model';

export interface InviteModel {
  id?: string;
  name: string;
  slug?: string;
  age: number;
  eventDate: string;
  address: string;
  mapUrl?: string;
  description?: string[];
  showAge: boolean;
  enableTimer: boolean;
  confirmEnable: boolean;
  profileUrl: string | null;
  darkMode: boolean;
  themeId: string;
  status: string;
  createdAt:string;
}
