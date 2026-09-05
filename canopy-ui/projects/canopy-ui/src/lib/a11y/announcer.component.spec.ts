import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CnA11yModule } from './a11y.module';
import { CnA11yAnnouncerComponent, CnA11yAnnouncerService } from './announcer.component';

describe('CnA11yAnnouncerComponent', () => {
  let fixture: ComponentFixture<CnA11yAnnouncerComponent>;
  let live: LiveAnnouncer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CnA11yModule] }).compileComponents();
    fixture = TestBed.createComponent(CnA11yAnnouncerComponent);
    live = TestBed.inject(LiveAnnouncer);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('forwards to the CDK live announcer with polite by default', async () => {
    const spy = spyOn(live, 'announce').and.returnValue(Promise.resolve());
    await fixture.componentInstance.announce('Transfer scheduled');
    expect(spy).toHaveBeenCalledWith('Transfer scheduled', 'polite', 5000);
  });

  it('ignores empty messages', async () => {
    const spy = spyOn(live, 'announce');
    await TestBed.inject(CnA11yAnnouncerService).announce('');
    expect(spy).not.toHaveBeenCalled();
  });
});
