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
});
