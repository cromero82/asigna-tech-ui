import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SolicitudService } from './solicitud';
import { environment } from '../../../environments/environment';

describe('SolicitudService', () => {
  let service: SolicitudService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(SolicitudService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista solicitudes', () => {
    service.listar().subscribe((lista) => expect(lista).toEqual([]));
    const req = http.expectOne(`${environment.apiUrl}/solicitudes`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
