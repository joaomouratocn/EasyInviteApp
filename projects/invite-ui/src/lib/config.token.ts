import { InjectionToken } from '@angular/core';

// Defina a estrutura que sua biblioteca precisa receber
export interface LibConfig {
  baseUrlRequest: string;
  production: boolean;
}

// Crie o token de injeção
export const LIB_CONFIG = new InjectionToken<LibConfig>('LIB_CONFIG');
