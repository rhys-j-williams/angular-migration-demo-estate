import { ModuleWithProviders, NgModule } from '@angular/core';
import { CN_CONFIG, CN_DEFAULT_CONFIG, CnConfig } from './canopy-config';

/**
 * Root module. Import once with `forRoot` in the application's CoreModule. Feature modules import
 * the component modules they need from the family entry points and never this one.
 */
@NgModule({})
export class CnCoreModule {
  static forRoot(config: Partial<CnConfig> = {}): ModuleWithProviders<CnCoreModule> {
    return {
      ngModule: CnCoreModule,
      providers: [
        { provide: CN_CONFIG, useValue: { ...CN_DEFAULT_CONFIG, ...config } }
      ]
    };
  }
}
