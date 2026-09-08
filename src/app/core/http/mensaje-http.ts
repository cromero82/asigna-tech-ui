import { HttpErrorResponse } from '@angular/common/http';

export function mensajeHttp(err: unknown, respaldo: string): string {
  if (err instanceof HttpErrorResponse && typeof err.error?.message === 'string') {
    return err.error.message;
  }
  return respaldo;
}
