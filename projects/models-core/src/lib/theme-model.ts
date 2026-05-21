import { ColorSchema } from './color-schema';

export interface Theme {
  id: string;
  themeName: string;
  title: string;
  subTitle: string;
  modalTitle: string;
  confirmText: string;
  getCoverUrl: string;
  bgImageUrl: string;
  getBgProfImageUrl: string;
  lightTheme: ColorSchema;
  darkTheme: ColorSchema;
}
