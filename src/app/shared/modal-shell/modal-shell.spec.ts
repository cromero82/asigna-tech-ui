import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalShell } from './modal-shell';

describe('ModalShell', () => {
  let fixture: ComponentFixture<ModalShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalShell]
    }).compileComponents();
    fixture = TestBed.createComponent(ModalShell);
    fixture.detectChanges();
  });

  it('cierra al pulsar el fondo, no el panel', () => {
    const cerrados: number[] = [];
    fixture.componentInstance.cerrar.subscribe(() => cerrados.push(1));
    const fondo = fixture.nativeElement.querySelector('.modal-backdrop') as HTMLElement;
    const panel = fixture.nativeElement.querySelector('.modal-panel') as HTMLElement;
    panel.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(cerrados).toEqual([]);
    fondo.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(cerrados).toEqual([1]);
  });

  it('cierra con Escape', () => {
    const cerrados: number[] = [];
    fixture.componentInstance.cerrar.subscribe(() => cerrados.push(1));
    fixture.componentInstance.onEscape();
    expect(cerrados).toEqual([1]);
  });
});
