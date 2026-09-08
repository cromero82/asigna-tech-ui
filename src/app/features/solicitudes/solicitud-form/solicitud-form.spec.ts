import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { CatalogoService } from '../../../core/services/catalogo';
import { SolicitudService } from '../../../core/services/solicitud';
import { RutaVacia } from '../../../shared/ruta-vacia';
import { SolicitudForm } from './solicitud-form';

const rutasPrueba = [{ path: 'solicitudes', component: RutaVacia }];

const catalogos = {
  listarServicios: () =>
    of([
      {
        id: 1,
        nombre: 'Impresoras',
        tiposServicio: [{ id: 10, nombre: 'Tóner', tipoTecnicoId: 1 }]
      }
    ]),
  listarTiposTecnico: () => of([]),
  listarTiposServicio: () => of([]),
  listarTecnicos: () => of([{ id: 3, nombre: 'Ana', correo: null, tipoTecnicoId: 1 }]),
  listarObjetos: () => of([{ id: 5, nombre: 'HP' }]),
  listarEstados: () =>
    of([
      { id: 1, codigo: 'PENDIENTE', nombre: 'Pendiente' },
      { id: 2, codigo: 'ASIGNADA', nombre: 'Asignada' },
      { id: 4, codigo: 'CERRADA', nombre: 'Cerrada' }
    ]),
  listarPrioridades: () => of([{ id: 2, codigo: 'MEDIA', nombre: 'Media' }]),
  listarResultados: () => of([{ id: 8, codigo: 'EXITOSA', nombre: 'Exitosa' }])
};

describe('SolicitudForm', () => {
  const solicitudService = {
    crear: vi.fn(() => of({ id: 1 })),
    actualizar: vi.fn(() => of({ id: 1 })),
    obtenerPorId: vi.fn(() =>
      of({
        id: 1,
        titulo: 'Cambio',
        descripcion: 'd',
        observaciones: null,
        tipoTecnico: { id: 1, nombre: 'Impresoras' },
        tipoServicio: { id: 10, nombre: 'Tóner' },
        tecnico: { id: 3, nombre: 'Ana' },
        objeto: { id: 5, nombre: 'HP' },
        estado: { id: 2, nombre: 'Asignada', codigo: 'ASIGNADA' },
        prioridad: { id: 2, nombre: 'Media' },
        resultado: null
      })
    )
  };

  async function montar(inputs?: { modoModal?: boolean; solicitudId?: number | null }) {
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [SolicitudForm],
      providers: [
        provideRouter(rutasPrueba),
        { provide: SolicitudService, useValue: solicitudService },
        { provide: CatalogoService, useValue: catalogos }
      ]
    }).compileComponents();
    const fixture = TestBed.createComponent(SolicitudForm);
    if (inputs?.modoModal) {
      fixture.componentRef.setInput('modoModal', true);
      fixture.componentRef.setInput('solicitudId', inputs.solicitudId ?? null);
    }
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  it('crea una solicitud válida y cancela en modal', async () => {
    const fixture = await montar({ modoModal: true, solicitudId: null });
    const cmp = fixture.componentInstance;
    const cerrados: { guardado: boolean }[] = [];
    cmp.cerrado.subscribe((e) => cerrados.push(e));
    cmp.guardar();
    expect(solicitudService.crear).not.toHaveBeenCalled();
    cmp.form.patchValue({ titulo: 'Cambio de tóner', tipoTecnicoId: 1, tipoServicioId: 10 });
    cmp.guardar();
    expect(solicitudService.crear).toHaveBeenCalled();
    cmp.cancelar();
    expect(cerrados.some((e) => e.guardado)).toBe(true);
    expect(cerrados.some((e) => !e.guardado)).toBe(true);
  });

  it('carga edición, alinea técnico y guarda', async () => {
    const fixture = await montar({ modoModal: true, solicitudId: 1 });
    const cmp = fixture.componentInstance;
    await fixture.whenStable();
    expect(cmp.esEdicion).toBe(true);
    cmp.onServicioSeleccionado({
      tipoTecnicoId: 1,
      tipoServicioId: 10,
      especialidadNombre: 'Impresoras',
      tipoServicioNombre: 'Tóner'
    });
    cmp.form.patchValue({
      titulo: 'Cambio',
      tipoTecnicoId: 1,
      tipoServicioId: 10,
      estadoId: 2,
      prioridadId: 2,
      tecnicoId: 3
    });
    cmp.guardar();
    expect(solicitudService.actualizar).toHaveBeenCalled();
    cmp.onServicioSeleccionado(null);
    expect(cmp.form.controls.tecnicoId.value).toBeNull();
  });

  it('cambia a Pendiente o Asignada según el técnico', async () => {
    const fixture = await montar({ modoModal: true, solicitudId: 1 });
    const cmp = fixture.componentInstance;
    await fixture.whenStable();
    cmp.form.controls.tecnicoId.setValue(null);
    expect(cmp.form.controls.estadoId.value).toBe(1);
    cmp.form.controls.tecnicoId.setValue(3);
    expect(cmp.estadosDisponibles().every((e) => e.codigo !== 'PENDIENTE')).toBe(true);
    cmp.form.controls.estadoId.setValue(4);
    expect(cmp.esCerrada()).toBe(true);
  });

  it('muestra errores de catálogo, carga y guardado', async () => {
    const catalogosRotos = {
      ...catalogos,
      listarServicios: () => throwError(() => new Error('down'))
    };
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [SolicitudForm],
      providers: [
        provideRouter(rutasPrueba),
        { provide: SolicitudService, useValue: solicitudService },
        { provide: CatalogoService, useValue: catalogosRotos }
      ]
    }).compileComponents();
    const rota = TestBed.createComponent(SolicitudForm);
    rota.componentRef.setInput('modoModal', true);
    rota.detectChanges();
    await rota.whenStable();
    expect(rota.componentInstance.error()).toContain('No se pudieron cargar los catálogos');

    solicitudService.obtenerPorId.mockReturnValue(
      throwError(
        () => new HttpErrorResponse({ error: { message: 'No existe' }, status: 404 })
      )
    );
    const edicion = await montar({ modoModal: true, solicitudId: 1 });
    expect(edicion.componentInstance.error()).toBe('No existe');

    solicitudService.obtenerPorId.mockReturnValue(
      of({
        id: 1,
        titulo: 'Cambio',
        descripcion: '',
        observaciones: null,
        tipoTecnico: { id: 1, nombre: 'Impresoras' },
        tipoServicio: { id: 10, nombre: 'Tóner' },
        tecnico: { id: 3, nombre: 'Ana' },
        objeto: { id: 5, nombre: 'HP' },
        estado: { id: 1, nombre: 'Pendiente', codigo: 'PENDIENTE' },
        prioridad: { id: 2, nombre: 'Media' },
        resultado: null
      })
    );
    solicitudService.crear.mockReturnValue(
      throwError(
        () => new HttpErrorResponse({ error: { message: 'titulo es obligatorio' }, status: 400 })
      )
    );
    solicitudService.actualizar.mockReturnValue(
      throwError(
        () => new HttpErrorResponse({ error: { message: 'sin técnico' }, status: 412 })
      )
    );
    const alta = await montar({ modoModal: true, solicitudId: null });
    alta.componentInstance.form.patchValue({
      titulo: 'Cambio de tóner',
      tipoTecnicoId: 1,
      tipoServicioId: 10
    });
    alta.componentInstance.guardar();
    expect(alta.componentInstance.error()).toBe('titulo es obligatorio');

    const put = await montar({ modoModal: true, solicitudId: 1 });
    await put.whenStable();
    put.componentInstance.form.patchValue({
      titulo: 'Cambio',
      tipoTecnicoId: 1,
      tipoServicioId: 10,
      estadoId: 1,
      prioridadId: 2
    });
    put.componentInstance.guardar();
    expect(put.componentInstance.error()).toBe('sin técnico');
  });

  it('cancela fuera de modal y filtra técnicos', async () => {
    const catalogosConTecnicos = {
      ...catalogos,
      listarTecnicos: vi.fn(() =>
        throwError(
          () => new HttpErrorResponse({ error: { message: 'filtro' }, status: 500 })
        )
      )
    };
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [SolicitudForm],
      providers: [
        provideRouter(rutasPrueba),
        { provide: SolicitudService, useValue: solicitudService },
        { provide: CatalogoService, useValue: catalogosConTecnicos }
      ]
    }).compileComponents();
    const fixture = TestBed.createComponent(SolicitudForm);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.componentInstance.onServicioSeleccionado({
      tipoTecnicoId: 1,
      tipoServicioId: 10,
      especialidadNombre: 'Impresoras',
      tipoServicioNombre: 'Tóner'
    });
    expect(fixture.componentInstance.error()).toBe('filtro');
    fixture.componentInstance.cancelar();
  });
});
