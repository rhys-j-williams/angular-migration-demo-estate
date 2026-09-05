import { TestBed } from '@angular/core/testing';
import { MatIconRegistry } from '@angular/material/icon';
import { CN_ICON_SPRITE_URL, CnIconRegistry } from './icon-registry';

describe('CnIconRegistry', () => {
  let registry: CnIconRegistry;
  let matRegistry: MatIconRegistry;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: CN_ICON_SPRITE_URL, useValue: 'assets/test-sprite.svg' }]
    });
    registry = TestBed.inject(CnIconRegistry);
    matRegistry = TestBed.inject(MatIconRegistry);
  });

  it('registers the sprite once under the cn namespace', () => {
    const spy = spyOn(matRegistry, 'addSvgIconSetInNamespace').and.callThrough();
    registry.register();
    registry.register();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.calls.mostRecent().args[0]).toBe('cn');
  });

  it('knows the sprite contents', () => {
    expect(registry.isKnown('transfer')).toBeTrue();
    expect(registry.isKnown('not-an-icon')).toBeFalse();
  });
});
