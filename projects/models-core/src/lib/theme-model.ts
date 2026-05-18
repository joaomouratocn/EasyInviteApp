import { ColorSchema } from './color-schema';

export interface Theme {
  id: string;
  themeName: string;
  title: string;
  subtitle: string;
  modalTitle: string;
  confirmText: string;
  getCoverUrl: string;
  bgImageUrl: string;
  getBgProfImageUrl: string;
  light: ColorSchema;
  dark: ColorSchema;
}
