import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CnToastService } from './toast.service';
import { CnToastModule } from './toast.module';

describe('CnToastService', () => {
  let toast: CnToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CnToastModule, NoopAnimationsModule] }).compileComponents();
    toast = TestBed.inject(CnToastService);
  });

  afterEach(() => toast.dismiss());

  it('shows a success toast in the Canopy snackbar container', () => {
    toast.success('Transfer scheduled');
    const container = document.querySelector('.mat-snack-bar-container.cn-toast--success') as HTMLElement;
    expect(container).toBeTruthy();
    expect(container.textContent).toContain('Transfer scheduled');
  });

  it('keeps error toasts open and exposes the action', () => {
    const ref = toast.error('Payments service unavailable', { action: 'Retry' });
    expect(ref.containerInstance.snackBarConfig.duration).toBe(0);
    expect(document.querySelector('.cn-toast__action')!.textContent!.trim()).toBe('Retry');
  });

  it('falls back to the simple snackbar when asked', () => {
    toast.show('Saved', { simple: true });
    expect(document.querySelector('.cn-toast .mat-simple-snackbar')).toBeTruthy();
  });
});
