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

  it('cubre listados y mutaciones de catálogo', () => {
    service.listarTiposServicio().subscribe();
    http.expectOne(`${environment.apiUrl}/tipos-servicio`).flush([]);
    service.listarTiposServicio(1).subscribe();
    http.expectOne(`${environment.apiUrl}/tipos-servicio?tipoTecnicoId=1`).flush([]);
    service.listarTecnicos().subscribe();
    http.expectOne(`${environment.apiUrl}/tecnicos`).flush([]);
    service.listarObjetos().subscribe();
    http.expectOne(`${environment.apiUrl}/objetos`).flush([]);
    service.listarEstados().subscribe();
    http.expectOne(`${environment.apiUrl}/estados-solicitud`).flush([]);
    service.listarPrioridades().subscribe();
    http.expectOne(`${environment.apiUrl}/prioridades`).flush([]);
    service.listarResultados().subscribe();
    http.expectOne(`${environment.apiUrl}/resultados-solicitud`).flush([]);

    service.crearTipoTecnico('Redes').subscribe();
    http.expectOne(`${environment.apiUrl}/tipos-tecnico`).flush({ id: 1, nombre: 'Redes' });
    service.crearTipoServicio({ nombre: 'Cableado', tipoTecnicoId: 1 }).subscribe();
    http.expectOne(`${environment.apiUrl}/tipos-servicio`).flush({});
    service.actualizarTipoServicio(2, { nombre: 'Cableado', tipoTecnicoId: 1 }).subscribe();
    http.expectOne(`${environment.apiUrl}/tipos-servicio/2`).flush({});
    service.eliminarTipoServicio(2).subscribe();
    http.expectOne(`${environment.apiUrl}/tipos-servicio/2`).flush(null);
    service.crearTecnico({ nombre: 'Ana', tipoTecnicoId: 1 }).subscribe();
    http.expectOne(`${environment.apiUrl}/tecnicos`).flush({});
    service.actualizarTecnico(3, { nombre: 'Ana', tipoTecnicoId: 1 }).subscribe();
    http.expectOne(`${environment.apiUrl}/tecnicos/3`).flush({});
    service.eliminarTecnico(3).subscribe();
    http.expectOne(`${environment.apiUrl}/tecnicos/3`).flush(null);
    service.actualizarObjeto(9, 'Monitor IPS').subscribe();
    http.expectOne(`${environment.apiUrl}/objetos/9`).flush({ id: 9, nombre: 'Monitor IPS' });
    service.eliminarObjeto(9).subscribe();
    http.expectOne(`${environment.apiUrl}/objetos/9`).flush(null);
  });
});
