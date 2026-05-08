import { Theme } from './theme-model';

export interface InviteModel {
  id?: string;
  slug?: string;
  name: string;
  age: string;
  date: string;
  address: string;
  mapUrl?: string;
  description?: string[];
  showAge: boolean;
  confirmedCount: number;
  enableTimer: boolean;
  confirmEnable: boolean;
  profileUrl: string | null;
  darkMode: boolean;
  theme: string;
  status: string;
}
