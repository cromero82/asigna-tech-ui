import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { CatalogoService } from '../../../core/services/catalogo';
import { SolicitudService } from '../../../core/services/solicitud';
import { Solicitud } from '../../../core/models/solicitud';
import { SolicitudList } from './solicitud-list';

const solicitud: Solicitud = {
  id: 1,
  titulo: 'Impresora rota',
  descripcion: null,
  observaciones: null,
  tipoTecnico: { id: 1, nombre: 'Impresoras' },
  tipoServicio: { id: 1, nombre: 'Cambio de tóner' },
  tecnico: null,
  objeto: null,
  estado: { id: 1, nombre: 'Pendiente', codigo: 'PENDIENTE' },
  prioridad: { id: 1, nombre: 'Media' },
  resultado: null,
  creadoEn: '',
  actualizadoEn: ''
};

describe('SolicitudList', () => {
  let fixture: ComponentFixture<SolicitudList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudList],
      providers: [
        provideRouter([]),
        {
          provide: SolicitudService,
          useValue: {
            listar: () => of([solicitud]),
            eliminar: () => of(undefined)
          }
        },
        {
          provide: CatalogoService,
          useValue: {
            listarEstados: () => of([{ id: 1, codigo: 'PENDIENTE', nombre: 'Pendiente' }]),
            listarTiposTecnico: () => of([{ id: 1, nombre: 'Impresoras' }])
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitudList);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('filtra el listado por título', () => {
    const cmp = fixture.componentInstance;
    cmp.busqueda.set('laptop');
    expect(cmp.filtradas()).toHaveLength(0);
    cmp.busqueda.set('impresora');
    expect(cmp.filtradas()).toHaveLength(1);
  });
});
