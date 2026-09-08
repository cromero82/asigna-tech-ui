import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CatalogoService } from './catalogo';
import { environment } from '../../../environments/environment';

describe('CatalogoService', () => {
  let service: CatalogoService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(CatalogoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('filtra técnicos por tipo', () => {
    service.listarTecnicos(1).subscribe((lista) => expect(lista.length).toBe(0));
    const req = http.expectOne(`${environment.apiUrl}/tecnicos?tipoTecnicoId=1`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('reutiliza tipos-tecnico sin un segundo GET', () => {
    service.listarTiposTecnico().subscribe();
    service.listarTiposTecnico().subscribe();
    const req = http.expectOne(`${environment.apiUrl}/tipos-tecnico`);
    req.flush([]);
  });

  it('carga especialidades agrupadas con tipos de servicio', () => {
    service.listarServicios().subscribe((lista) => expect(lista.length).toBe(0));
    const req = http.expectOne(`${environment.apiUrl}/servicios`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('invalida el cache de tipos-tecnico al crear un objeto', () => {
    service.listarTiposTecnico().subscribe();
    http.expectOne(`${environment.apiUrl}/tipos-tecnico`).flush([]);
    service.crearObjeto('Monitor').subscribe();
    const crear = http.expectOne(`${environment.apiUrl}/objetos`);
    expect(crear.request.method).toBe('POST');
    crear.flush({ id: 9, nombre: 'Monitor' });
    service.listarTiposTecnico().subscribe();
    http.expectOne(`${environment.apiUrl}/tipos-tecnico`).flush([]);
  });
});
