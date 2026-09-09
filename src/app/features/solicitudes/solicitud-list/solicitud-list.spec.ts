import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { CatalogoService } from '../../../core/services/catalogo';
import { SolicitudService } from '../../../core/services/solicitud';
import { Solicitud } from '../../../core/models/solicitud';
import { RutaVacia } from '../../../shared/ruta-vacia';
import { SolicitudList } from './solicitud-list';

const solicitud: Solicitud = {
  id: 1,
  titulo: 'Impresora rota',
  descripcion: null,
  observaciones: null,
  tipoTecnico: { id: 1, nombre: 'Impresoras' },
  tipoServicio: { id: 1, nombre: 'Cambio de tóner' },
  tecnico: { id: 3, nombre: 'Ana' },
  objeto: { id: 5, nombre: 'HP' },
  estado: { id: 1, nombre: 'Pendiente', codigo: 'PENDIENTE' },
  prioridad: { id: 1, nombre: 'Media' },
  resultado: null,
  creadoEn: '',
  actualizadoEn: ''
};

describe('SolicitudList', () => {
  let fixture: ComponentFixture<SolicitudList>;
  const solicitudService = {
    listar: vi.fn(() => of([solicitud])),
    eliminar: vi.fn(() => of(undefined)),
    obtenerPorId: vi.fn(() => of(solicitud)),
    crear: vi.fn(() => of(solicitud)),
    actualizar: vi.fn(() => of(solicitud))
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    solicitudService.listar.mockReturnValue(of([solicitud]));
    solicitudService.eliminar.mockReturnValue(of(undefined));
    await TestBed.configureTestingModule({
      imports: [SolicitudList],
      providers: [
        provideRouter([
          {
            path: 'solicitudes',
            children: [
              { path: '', component: RutaVacia },
              { path: 'nueva', component: RutaVacia },
              { path: ':id/editar', component: RutaVacia }
            ]
          }
        ]),
        { provide: SolicitudService, useValue: solicitudService },
        {
          provide: CatalogoService,
          useValue: {
            listarEstados: () => of([{ id: 1, codigo: 'PENDIENTE', nombre: 'Pendiente' }]),
            listarTiposTecnico: () => of([{ id: 1, nombre: 'Impresoras' }]),
            listarServicios: () =>
              of([
                {
                  id: 1,
                  nombre: 'Impresoras',
                  tiposServicio: [{ id: 10, nombre: 'Tóner', tipoTecnicoId: 1 }]
                }
              ]),
            listarObjetos: () => of([{ id: 5, nombre: 'HP' }]),
            listarPrioridades: () => of([{ id: 2, codigo: 'MEDIA', nombre: 'Media' }]),
            listarResultados: () => of([{ id: 8, codigo: 'EXITOSA', nombre: 'Exitosa' }]),
            listarTecnicos: () => of([])
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

  it('filtra el listado por título, estado y especialidad', () => {
    const cmp = fixture.componentInstance;
    cmp.busqueda.set('laptop');
    expect(cmp.filtradas()).toHaveLength(0);
    cmp.busqueda.set('impresora');
    expect(cmp.filtradas()).toHaveLength(1);
    cmp.limpiarFiltros();
    cmp.estadoFiltro.set(9);
    expect(cmp.filtradas()).toHaveLength(0);
    cmp.estadoFiltro.set(1);
    cmp.especialidadFiltro.set(1);
    expect(cmp.filtradas()).toHaveLength(1);
    expect(cmp.hayFiltros()).toBe(true);
    cmp.limpiarFiltros();
    expect(cmp.hayFiltros()).toBe(false);
  });

  it('aplica filtros desde los selects y confirma el borrado', () => {
    const cmp = fixture.componentInstance;
    cmp.onEstado({ target: { value: '1' } } as unknown as Event);
    cmp.onEspecialidad({ target: { value: '' } } as unknown as Event);
    expect(cmp.estadoFiltro()).toBe(1);
    expect(cmp.mensajeEliminar(solicitud)).toContain('Impresora rota');
    cmp.confirmarEliminar();
    cmp.pedirEliminar(solicitud);
    cmp.confirmarEliminar();
    expect(solicitudService.eliminar).toHaveBeenCalledWith(1);
    cmp.onFormCerrado({ guardado: true });
    cmp.onFormCerrado({ guardado: false });
    cmp.cerrarFormulario();
    expect(cmp.formKeys()).toEqual([]);
  });

  it('muestra error si el listado falla', async () => {
    solicitudService.listar.mockReturnValue(throwError(() => new Error('down')));
    const otra = TestBed.createComponent(SolicitudList);
    await otra.whenStable();
    expect(otra.componentInstance.error()).toContain('No se pudo cargar el listado');
  });

  it('abre el modal según la URL y falla al eliminar', async () => {
    const cmp = fixture.componentInstance;
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/solicitudes/nueva');
    await fixture.whenStable();
    expect(cmp.formAbierto()).toBe(true);
    expect(cmp.formKeys()).toEqual(['nueva']);
    await router.navigateByUrl('/solicitudes/7/editar');
    await fixture.whenStable();
    expect(cmp.formId()).toBe(7);
    expect(cmp.formKeys()).toEqual(['editar-7']);
    await router.navigateByUrl('/solicitudes');
    await fixture.whenStable();
    expect(cmp.formAbierto()).toBe(false);

    solicitudService.eliminar.mockReturnValue(
      throwError(
        () => new HttpErrorResponse({ error: { message: 'no' }, status: 412 })
      )
    );
    cmp.pedirEliminar(solicitud);
    cmp.confirmarEliminar();
    expect(cmp.error()).toBe('no');
  });
});
