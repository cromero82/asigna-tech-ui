import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ActivatedRoute } from '@angular/router';
import { CatalogoService } from '../../core/services/catalogo';
import { DominioList } from './dominio-list';

describe('DominioList', () => {
  let fixture: ComponentFixture<DominioList>;
  const catalogo = {
    listarServicios: vi.fn(() => of([])),
    listarTiposTecnico: vi.fn(() => of([{ id: 1, nombre: 'Impresoras' }])),
    listarTiposServicio: vi.fn(() => of([])),
    listarTecnicos: vi.fn(() => of([])),
    listarObjetos: vi.fn(() => of([])),
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

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [DominioList],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ dominio: 'tecnico', titulo: 'Técnico' })
          }
        },
        { provide: CatalogoService, useValue: catalogo }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DominioList);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('en Técnico solo pide técnicos y especialidades una vez', () => {
    expect(catalogo.listarTecnicos).toHaveBeenCalledTimes(1);
    expect(catalogo.listarTiposTecnico).toHaveBeenCalledTimes(1);
    expect(catalogo.listarObjetos).not.toHaveBeenCalled();
    expect(catalogo.listarServicios).not.toHaveBeenCalled();
  });
});
