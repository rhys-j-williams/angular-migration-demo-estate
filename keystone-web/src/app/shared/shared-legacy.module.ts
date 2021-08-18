import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { BusyOverlayComponent } from './components/busy-overlay/busy-overlay.component';
import { LegacyMaterialModule } from './legacy/legacy-material.module';

@NgModule({
  declarations: [BusyOverlayComponent],
  imports: [CommonModule, LegacyMaterialModule],
  exports: [BusyOverlayComponent, LegacyMaterialModule],
})
export class SharedLegacyModule {}
