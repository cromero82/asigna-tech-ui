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

  it('crea, actualiza y elimina por HTTP', () => {
    service.crear({ titulo: 'X', tipoTecnicoId: 1, tipoServicioId: 2 }).subscribe();
    const crear = http.expectOne(`${environment.apiUrl}/solicitudes`);
    expect(crear.request.method).toBe('POST');
    crear.flush({ id: 1 });

    service.obtenerPorId(1).subscribe();
    http.expectOne(`${environment.apiUrl}/solicitudes/1`).flush({ id: 1 });

    service
      .actualizar(1, {
        titulo: 'X',
        tipoTecnicoId: 1,
        tipoServicioId: 2,
        estadoId: 1,
        prioridadId: 2
      })
      .subscribe();
    const put = http.expectOne(`${environment.apiUrl}/solicitudes/1`);
    expect(put.request.method).toBe('PUT');
    put.flush({ id: 1 });

    service.eliminar(1).subscribe();
    const del = http.expectOne(`${environment.apiUrl}/solicitudes/1`);
    expect(del.request.method).toBe('DELETE');
    del.flush(null);
  });
});
