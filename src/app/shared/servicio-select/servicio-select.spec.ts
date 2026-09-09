import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServicioGrupo } from '../../core/models/catalogo';
import { ServicioSelect } from './servicio-select';

describe('ServicioSelect', () => {
  let fixture: ComponentFixture<ServicioSelect>;
  const grupos: ServicioGrupo[] = [
    {
      id: 1,
      nombre: 'Android',
      tiposServicio: [{ id: 10, nombre: 'Mantenimiento', tipoTecnicoId: 1 }]
    },
    {
      id: 2,
      nombre: 'Laptops (Portátiles) y computadores',
      tiposServicio: [
        { id: 20, nombre: 'Instalación de software', tipoTecnicoId: 2 },
        { id: 21, nombre: 'Mantenimiento', tipoTecnicoId: 2 }
      ]
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicioSelect]
    }).compileComponents();

    fixture = TestBed.createComponent(ServicioSelect);
    fixture.componentRef.setInput('grupos', grupos);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('emite solo el tipo de servicio elegido', () => {
    const emitidas: unknown[] = [];
    fixture.componentInstance.seleccion.subscribe((valor) => emitidas.push(valor));
    fixture.componentInstance.abrir();
    fixture.detectChanges();
    const opciones = fixture.nativeElement.querySelectorAll('.option') as NodeListOf<HTMLButtonElement>;
    opciones[2].click();
    expect(emitidas).toEqual([
      {
        tipoTecnicoId: 2,
        tipoServicioId: 21,
        especialidadNombre: 'Laptops (Portátiles) y computadores',
        tipoServicioNombre: 'Mantenimiento'
      }
    ]);
  });

  it('filtra, navega con teclado y limpia al cerrar vacío', () => {
    const cmp = fixture.componentInstance;
    const emitidas: unknown[] = [];
    cmp.seleccion.subscribe((valor) => emitidas.push(valor));
    fixture.componentRef.setInput('tipoServicioId', 21);
    fixture.detectChanges();
    cmp.abrir();
    expect(cmp.esActiva(21)).toBe(true);
    cmp.onInput({ target: { value: 'android' } } as unknown as Event);
    expect(cmp.gruposFiltrados()).toHaveLength(1);
    cmp.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    cmp.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    cmp.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(emitidas.at(-1)).toEqual(
      expect.objectContaining({ tipoServicioId: 10, especialidadNombre: 'Android' })
    );
    cmp.abrir();
    cmp.onInput({ target: { value: '' } } as unknown as Event);
    cmp.onKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(emitidas.at(-1)).toBeNull();
    cmp.abrir();
    cmp.onDocumento(new MouseEvent('mousedown'));
    expect(cmp.abierto()).toBe(false);
  });
});
