import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { CnDialogService } from '@meridian/canopy-ui/overlays';

import { HasUnsavedChanges, UnsavedChangesGuard } from './unsaved-changes.guard';

describe('UnsavedChangesGuard', () => {
  let guard: UnsavedChangesGuard;
  let dialog: jasmine.SpyObj<CnDialogService>;

  beforeEach(() => {
    dialog = jasmine.createSpyObj<CnDialogService>('CnDialogService', ['confirm']);
    TestBed.configureTestingModule({ providers: [{ provide: CnDialogService, useValue: dialog }] });
    guard = TestBed.inject(UnsavedChangesGuard);
  });

  it('lets a clean form go without asking', done => {
    const component: HasUnsavedChanges = { hasUnsavedChanges: () => false };
    guard.canDeactivate(component).subscribe(ok => {
      expect(ok).toBeTrue();
      expect(dialog.confirm).not.toHaveBeenCalled();
      done();
    });
  });

  it('tolerates components that do not implement the interface', done => {
    guard.canDeactivate(null).subscribe(ok => {
      expect(ok).toBeTrue();
      done();
    });
  });

  it('asks with a destructive confirm when the form is dirty and returns the answer', done => {
    dialog.confirm.and.returnValue(of(false));
    const component: HasUnsavedChanges = {
      hasUnsavedChanges: () => true,
      unsavedChangesMessage: () => 'Your transfer has not been submitted.'
    };
    guard.canDeactivate(component).subscribe(ok => {
      expect(ok).toBeFalse();
      expect(dialog.confirm).toHaveBeenCalledWith(jasmine.objectContaining({
        message: 'Your transfer has not been submitted.',
        destructive: true
      }));
      done();
    });
  });
});
