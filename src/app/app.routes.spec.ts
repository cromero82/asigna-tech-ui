import { routes } from './app.routes';

describe('routes', () => {
  it('define solicitudes y dominios', () => {
    expect(routes.some((r) => r.path === 'solicitudes')).toBe(true);
    expect(routes.some((r) => r.path === 'dominios/objetos')).toBe(true);
  });
});
