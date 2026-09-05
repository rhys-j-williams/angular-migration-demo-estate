import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import { StatementsApiService } from '../../../../core/api/statements-api.service';
import { AppError } from '../../../../core/errors/app-error.model';
import { LanternService } from '../../../../core/telemetry/lantern.service';
import { StatementListComponent } from '../statement-list/statement-list.component';

/**
 * In-page PDF viewer with download. Renders the blob in an iframe via an object URL, which the CSP
 * allows through `frame-src blob:`. Safari on iOS ignores the iframe and opens the PDF in a tab;
 * that is acceptable and documented in the help centre.
 */
@Component({
  selector: 'mol-statement-viewer',
  templateUrl: './statement-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementViewerComponent implements OnInit, OnDestroy {
  readonly statementId = this.route.snapshot.paramMap.get('statementId') ?? '';
  src: SafeResourceUrl | null = null;
  error: AppError | null = null;
  private blob: Blob | null = null;
  private objectUrl: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: StatementsApiService,
    private readonly sanitizer: DomSanitizer,
    private readonly lantern: LanternService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.api.download(this.statementId).subscribe({
      next: blob => {
        this.blob = blob;
        this.objectUrl = URL.createObjectURL(blob);
        this.src = this.sanitizer.bypassSecurityTrustResourceUrl(`${this.objectUrl}#toolbar=0`);
        this.lantern.track('statements.viewed', { sizeKb: Math.round(blob.size / 1024) });
        this.cdr.markForCheck();
      },
      error: (err: AppError) => {
        this.error = err;
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
  }

  download(): void {
    if (this.blob) StatementListComponent.saveBlob(this.blob, `meridian-statement-${this.statementId}.pdf`);
  }

  print(): void {
    window.print();
  }
}
