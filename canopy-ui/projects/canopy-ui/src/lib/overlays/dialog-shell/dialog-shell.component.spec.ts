import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CnDialogService } from './dialog.service';
import { CnDialogShellModule } from './dialog-shell.module';

describe('CnDialogShellComponent / CnDialogService', () => {
  let service: CnDialogService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CnDialogShellModule, NoopAnimationsModule] }).compileComponents();
    service = TestBed.inject(CnDialogService);
  });

  afterEach(() => service.closeAll());

  it('opens a confirm dialog in the Canopy panel and resolves the answer', async () => {
    const result = service.confirm({ title: 'Close account?', message: 'This cannot be undone.', destructive: true }).toPromise();
    await new Promise(r => setTimeout(r));
    TestBed.inject(ApplicationRef).tick();
    const container = document.querySelector('.cn-dialog-panel .mat-dialog-container') as HTMLElement;
    expect(container).toBeTruthy();
    expect(container.querySelector('.cn-dialog-shell__title')!.textContent).toContain('Close account?');
    const confirm = container.querySelector('.cn-confirm-dialog__confirm') as HTMLButtonElement;
    expect(confirm).toBeTruthy();
    confirm.click();
    expect(await result).toBeTrue();
  });
});
