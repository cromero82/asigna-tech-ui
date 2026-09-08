import { TestBed } from '@angular/core/testing';
import { appConfig } from './app.config';

describe('appConfig', () => {
  it('registra router y http', () => {
    expect(appConfig.providers?.length).toBeGreaterThan(0);
    TestBed.configureTestingModule({ providers: appConfig.providers });
    expect(TestBed).toBeTruthy();
  });
});
