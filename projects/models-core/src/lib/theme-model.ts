import { ColorSchema } from './color-schema';

export interface Theme {
  id: string;
  themeName: string;
  title: string;
  subtitle: string;
  modalTitle: string;
  confirmText: string;
  cover: string;
  bgimage: string;
  bgProfImage: string;
  light: ColorSchema;
  dark: ColorSchema;
}
