import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CnSkeletonComponent } from './skeleton.component';

@NgModule({ imports: [CommonModule], declarations: [CnSkeletonComponent], exports: [CnSkeletonComponent] })
export class CnSkeletonModule {}
