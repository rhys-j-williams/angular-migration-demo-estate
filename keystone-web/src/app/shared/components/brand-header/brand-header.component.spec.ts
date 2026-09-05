import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { BrandHeaderComponent } from './brand-header.component';

describe('BrandHeaderComponent', () => {
  let fixture: ComponentFixture<BrandHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [BrandHeaderComponent, HttpClientTestingModule] }).compileComponents();
    fixture = TestBed.createComponent(BrandHeaderComponent);
    fixture.detectChanges();
  });

  it('names the bank and shows the secure badge by default', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Meridian Trust Bank');
    expect(el.querySelector('.ks-brand__secure')).not.toBeNull();
  });

  it('can hide the badge on error screens', () => {
    fixture.componentInstance.showLock = false;
    fixture.componentRef.setInput('showLock', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.ks-brand__secure')).toBeNull();
  });
});
