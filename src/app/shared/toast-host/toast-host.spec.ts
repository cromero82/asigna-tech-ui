import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastService } from '../../core/ui/toast';
import { ToastHost } from './toast-host';

describe('ToastHost', () => {
  it('pinta toasts de éxito', async () => {
    await TestBed.configureTestingModule({
      imports: [ToastHost]
    }).compileComponents();
    const fixture = TestBed.createComponent(ToastHost);
    TestBed.inject(ToastService).exito('Listo');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Listo');
  });
});
