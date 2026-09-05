import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CnIconRegistry } from './icon-registry';

/**
 * Registers the sprite as a side effect of import, so applications only need this module in their
 * CoreModule. Feature modules import MatIconModule directly.
 */
@NgModule({
  imports: [MatIconModule],
  exports: [MatIconModule]
})
export class CnIconModule {
  constructor(registry: CnIconRegistry) {
    registry.register();
  }
}
