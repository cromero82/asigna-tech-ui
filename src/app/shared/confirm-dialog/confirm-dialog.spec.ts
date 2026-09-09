import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialog } from './confirm-dialog';

describe('ConfirmDialog', () => {
  it('emite confirmado y cancelado', async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialog]
    }).compileComponents();
    const fixture = TestBed.createComponent(ConfirmDialog);
    fixture.componentRef.setInput('mensaje', '¿Eliminar?');
    fixture.detectChanges();
    const eventos: string[] = [];
    fixture.componentInstance.confirmado.subscribe(() => eventos.push('ok'));
    fixture.componentInstance.cancelado.subscribe(() => eventos.push('no'));
    const botones = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    const confirmar = [...botones].find((b) => b.textContent?.includes('Eliminar'));
    const cancelar = [...botones].find((b) => b.textContent?.includes('Cancelar'));
    confirmar?.click();
    cancelar?.click();
    expect(eventos).toEqual(['ok', 'no']);
  });
});
