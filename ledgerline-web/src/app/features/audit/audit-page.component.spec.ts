import { TestBed } from '@angular/core/testing';

import { FixtureBackendState } from '../../core/fixture-backend/fixture-backend.state';
import { AuditEvent } from '../../core/models/audit';
import { renderPage, settle } from '../../testing/page-testing';
import { AuditPageComponent } from './audit-page.component';

const rows = (fixture: { nativeElement: HTMLElement }) =>
  fixture.nativeElement.querySelectorAll('tbody tr, tr.mat-mdc-row').length;

describe('AuditPageComponent', () => {
  it('renders the first server page of events with the pager range', async () => {
    const fixture = await renderPage(AuditPageComponent);
    const dataset = TestBed.inject(FixtureBackendState).dataset;
    expect(rows(fixture)).toBe(Math.min(50, dataset.audit.length));
    expect(fixture.nativeElement.querySelector('.ldg-audit__pager')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('ldg-audit-export-button')).not.toBeNull();
  });

  it('re-queries on filter change, resets to page 0 and drops the selection', async () => {
    const fixture = await renderPage(AuditPageComponent);
    const dataset = TestBed.inject(FixtureBackendState).dataset;
    const first: AuditEvent = fixture.componentInstance['events']()[0];
    fixture.componentInstance['selected'].set(first);
    fixture.componentInstance['page'].set(1);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('ldg-audit-event-detail')).not.toBeNull();

    fixture.componentInstance.onQuery({ categories: ['session'] });
    await settle(fixture);
    const sessionEvents = dataset.audit.filter(e => e.category === 'session').length;
    expect(fixture.componentInstance['page']()).toBe(0);
    expect(fixture.componentInstance['selected']()).toBeNull();
    expect(fixture.componentInstance['total']()).toBe(sessionEvents);
    expect(rows(fixture)).toBe(Math.min(50, sessionEvents));
  });

  it('hides the export button when the flag is off', async () => {
    const fixture = await renderPage(AuditPageComponent, {}, undefined,
      { featureFlags: { positivePayBulkDecision: true, auditExport: false, fxStreaming: false } });
    expect(fixture.nativeElement.querySelector('ldg-audit-export-button')).toBeNull();
  });
});
