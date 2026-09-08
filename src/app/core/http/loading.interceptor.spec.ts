import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { loadingInterceptor } from './loading.interceptor';
import { LoadingService } from '../ui/loading';

describe('loadingInterceptor', () => {
  it('marca loading mientras hay una petición', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting()
      ]
    });
    const http = TestBed.inject(HttpClient);
    const controller = TestBed.inject(HttpTestingController);
    const loading = TestBed.inject(LoadingService);

    http.get('/x').subscribe();
    expect(loading.visible()).toBe(true);
    controller.expectOne('/x').flush({});
    expect(loading.visible()).toBe(false);

    http.get('/y').subscribe({ error: () => undefined });
    expect(loading.visible()).toBe(true);
    controller.expectOne('/y').error(new ProgressEvent('error'));
    expect(loading.visible()).toBe(false);
  });
});
