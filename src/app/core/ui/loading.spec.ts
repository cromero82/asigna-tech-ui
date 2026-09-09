import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading';

describe('LoadingService', () => {
  it('solo se oculta cuando terminan todas las peticiones', () => {
    const loading = TestBed.inject(LoadingService);
    loading.begin();
    loading.begin();
    expect(loading.visible()).toBe(true);
    loading.end();
    expect(loading.visible()).toBe(true);
    loading.end();
    expect(loading.visible()).toBe(false);
  });
});
