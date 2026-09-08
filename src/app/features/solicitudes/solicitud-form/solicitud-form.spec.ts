import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { CatalogoService } from '../../../core/services/catalogo';
import { SolicitudService } from '../../../core/services/solicitud';
import { SolicitudForm } from './solicitud-form';

describe('SolicitudForm', () => {
  let fixture: ComponentFixture<SolicitudForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudForm],
      providers: [
        provideRouter([]),
        {
          provide: SolicitudService,
          useValue: {
            crear: () => of({}),
            actualizar: () => of({}),
            obtenerPorId: () => of({})
          }
        },
        {
          provide: CatalogoService,
          useValue: {
            listarTiposTecnico: () => of([]),
            listarTiposServicio: () => of([]),
            listarTecnicos: () => of([]),
            listarObjetos: () => of([]),
            listarEstados: () => of([]),
            listarPrioridades: () => of([]),
            listarResultados: () => of([])
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitudForm);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
