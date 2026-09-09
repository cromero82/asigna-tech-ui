import { HttpErrorResponse } from '@angular/common/http';
import { mensajeHttp } from './mensaje-http';

describe('mensajeHttp', () => {
  it('usa el message del API', () => {
    const err = new HttpErrorResponse({
      error: { status: 400, message: 'titulo es obligatorio' },
      status: 400
    });
    expect(mensajeHttp(err, 'respaldo')).toBe('titulo es obligatorio');
  });

  it('cae al respaldo si no hay message', () => {
    expect(mensajeHttp(new Error('x'), 'No se pudo guardar.')).toBe('No se pudo guardar.');
    expect(
      mensajeHttp(new HttpErrorResponse({ error: {}, status: 500 }), 'respaldo')
    ).toBe('respaldo');
  });
});
