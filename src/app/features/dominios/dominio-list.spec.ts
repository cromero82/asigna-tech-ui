import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ActivatedRoute } from '@angular/router';
import { CatalogoService } from '../../core/services/catalogo';
import { DominioList } from './dominio-list';

describe('DominioList', () => {
  const catalogo = {
    listarServicios: vi.fn(() =>
      of([
        {
          id: 1,
          nombre: 'Impresoras',
          tiposServicio: [{ id: 10, nombre: 'Tóner', tipoTecnicoId: 1 }]
        }
      ])
    ),
    listarTiposTecnico: vi.fn(() => of([{ id: 1, nombre: 'Impresoras' }])),
    listarTiposServicio: vi.fn(() => of([])),
    listarTecnicos: vi.fn(() =>
      of([{ id: 3, nombre: 'Ana', correo: 'a@x.com', tipoTecnicoId: 1 }])
    ),
    listarObjetos: vi.fn(() => of([{ id: 5, nombre: 'Switch' }])),
    crearTipoTecnico: vi.fn(() => of({ id: 2, nombre: 'Nueva' })),
    crearTipoServicio: vi.fn(() => of({})),
    actualizarTipoServicio: vi.fn(() => of({})),
    eliminarTipoServicio: vi.fn(() => of(undefined)),
    crearTecnico: vi.fn(() => of({})),
    actualizarTecnico: vi.fn(() => of({})),
    eliminarTecnico: vi.fn(() => of(undefined)),
    crearObjeto: vi.fn(() => of({})),
    actualizarObjeto: vi.fn(() => of({})),
    eliminarObjeto: vi.fn(() => of(undefined)),
    invalidarCache: vi.fn()
  };

  async function montar(dominio: string, titulo: string): Promise<ComponentFixture<DominioList>> {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [DominioList],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ dominio, titulo }) }
        },
        { provide: CatalogoService, useValue: catalogo }
      ]
    }).compileComponents();
    const fixture = TestBed.createComponent(DominioList);
    await fixture.whenStable();
    return fixture;
  }

  it('en Técnico solo pide técnicos y especialidades una vez', async () => {
    const fixture = await montar('tecnico', 'Técnico');
    expect(fixture.componentInstance).toBeTruthy();
    expect(catalogo.listarTecnicos).toHaveBeenCalledTimes(1);
    expect(catalogo.listarTiposTecnico).toHaveBeenCalledTimes(1);
    expect(catalogo.listarObjetos).not.toHaveBeenCalled();
    expect(catalogo.listarServicios).not.toHaveBeenCalled();
  });

  it('crea y elimina un técnico', async () => {
    const fixture = await montar('tecnico', 'Técnico');
    const cmp = fixture.componentInstance;
    expect(cmp.muestraCorreo).toBe(true);
    cmp.abrirCrear();
    cmp.form.patchValue({ nombre: 'Ana', tipoTecnicoId: 1, correo: 'a@x.com' });
    cmp.guardar();
    expect(catalogo.crearTecnico).toHaveBeenCalled();
    const fila = { id: 3, nombre: 'Ana', tipoTecnicoId: 1 };
    cmp.abrirEditar(fila);
    expect(cmp.esEdicion).toBe(true);
    cmp.guardar();
    expect(catalogo.actualizarTecnico).toHaveBeenCalled();
    cmp.pedirEliminar(fila);
    expect(cmp.mensajeEliminar(fila)).toContain('Ana');
    cmp.confirmarEliminar();
    expect(catalogo.eliminarTecnico).toHaveBeenCalledWith(3);
  });

  it('exige especialidad al guardar técnico', async () => {
    const fixture = await montar('tecnico', 'Técnico');
    const cmp = fixture.componentInstance;
    cmp.abrirCrear();
    cmp.form.patchValue({ nombre: 'Ana', tipoTecnicoId: null });
    cmp.guardar();
    expect(cmp.error()).toBe('Seleccione una especialidad.');
  });

  it('crea objeto y servicio, incluyendo especialidad nueva', async () => {
    const objetos = await montar('objeto', 'Objeto');
    const obj = objetos.componentInstance;
    expect(obj.muestraEspecialidad).toBe(false);
    obj.abrirCrear();
    obj.form.patchValue({ nombre: 'Switch' });
    obj.guardar();
    expect(catalogo.crearObjeto).toHaveBeenCalledWith('Switch');
    obj.abrirEditar({ id: 5, nombre: 'Switch' });
    obj.guardar();
    expect(catalogo.actualizarObjeto).toHaveBeenCalled();
    obj.pedirEliminar({ id: 5, nombre: 'Switch' });
    obj.confirmarEliminar();
    expect(catalogo.eliminarObjeto).toHaveBeenCalledWith(5);

    const servicios = await montar('servicio', 'Servicio');
    const srv = servicios.componentInstance;
    expect(srv.muestraNuevaEspecialidad).toBe(true);
    srv.abrirCrear();
    srv.form.patchValue({ nombre: 'Cableado', tipoTecnicoId: 1 });
    srv.guardar();
    expect(catalogo.crearTipoServicio).toHaveBeenCalled();
    srv.abrirCrear();
    srv.form.patchValue({ nombre: 'Apps', tipoTecnicoId: null, nuevaEspecialidad: 'Android' });
    srv.guardar();
    expect(catalogo.crearTipoTecnico).toHaveBeenCalledWith('Android');
    srv.abrirEditar({ id: 10, nombre: 'Tóner', tipoTecnicoId: 1 });
    srv.form.patchValue({ nombre: 'Tóner', tipoTecnicoId: 1, nuevaEspecialidad: '' });
    srv.guardar();
    expect(catalogo.actualizarTipoServicio).toHaveBeenCalled();
    srv.pedirEliminar({ id: 10, nombre: 'Tóner' });
    srv.confirmarEliminar();
    expect(catalogo.eliminarTipoServicio).toHaveBeenCalledWith(10);
  });

  it('valida servicio sin especialidad y no elimina si no hay pendiente', async () => {
    const fixture = await montar('servicio', 'Servicio');
    const cmp = fixture.componentInstance;
    cmp.abrirCrear();
    cmp.form.patchValue({ nombre: 'X', tipoTecnicoId: null, nuevaEspecialidad: '' });
    cmp.guardar();
    expect(cmp.error()).toBe('Seleccione una especialidad o cree una nueva.');
    cmp.confirmarEliminar();
    expect(catalogo.eliminarTipoServicio).not.toHaveBeenCalled();
    cmp.form.controls.nombre.setValue('');
    cmp.guardar();
    expect(cmp.form.controls.nombre.touched).toBe(true);
  });

  it('muestra error al cargar y al guardar o eliminar', async () => {
    catalogo.listarObjetos.mockReturnValue(throwError(() => new Error('down')));
    const carga = await montar('objeto', 'Objeto');
    expect(carga.componentInstance.error()).toBe('No se pudo cargar el catálogo.');

    catalogo.listarObjetos.mockReturnValue(of([{ id: 5, nombre: 'Switch' }]));
    catalogo.crearObjeto.mockReturnValue(
      throwError(
        () => new HttpErrorResponse({ error: { message: 'Ya existe' }, status: 400 })
      )
    );
    const fixture = await montar('objeto', 'Objeto');
    const cmp = fixture.componentInstance;
    cmp.abrirCrear();
    cmp.form.patchValue({ nombre: 'Switch' });
    cmp.guardar();
    expect(cmp.error()).toBe('Ya existe');

    catalogo.eliminarObjeto.mockReturnValue(
      throwError(
        () => new HttpErrorResponse({ error: { message: 'En uso' }, status: 412 })
      )
    );
    cmp.abrirEditar({ id: 5, nombre: 'Switch' });
    cmp.pedirEliminar({ id: 5, nombre: 'Switch' });
    cmp.confirmarEliminar();
    expect(cmp.error()).toBe('En uso');
  });

  it('falla al crear especialidad nueva y cierra el form si se elimina el que se edita', async () => {
    catalogo.crearTipoTecnico.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            error: { message: 'Nombre duplicado' },
            status: 400
          })
      )
    );
    const fixture = await montar('servicio', 'Servicio');
    const cmp = fixture.componentInstance;
    cmp.abrirCrear();
    cmp.form.patchValue({ nombre: 'Apps', tipoTecnicoId: null, nuevaEspecialidad: 'Android' });
    cmp.guardar();
    expect(cmp.error()).toBe('Nombre duplicado');

    catalogo.eliminarTipoServicio.mockReturnValue(of(undefined));
    const fila = { id: 10, nombre: 'Tóner', tipoTecnicoId: 1 };
    cmp.abrirEditar(fila);
    expect(cmp.formularioVisible()).toBe(true);
    cmp.pedirEliminar(fila);
    cmp.confirmarEliminar();
    expect(cmp.formularioVisible()).toBe(false);
  });
});
