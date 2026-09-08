# asigna-tech-ui

Frontend Angular **21** de asignación de solicitudes a técnicos TI. Consume `asigna-tech-service` por REST (`http://localhost:3000/api`).

Sin template de terceros: componentes propios (`SolicitudList`, `SolicitudForm`) y servicios (`SolicitudService`, `CatalogoService`).

## Arranque (con el API ya levantado)

En una terminal, el backend:

```bash
cd asigna-tech-service
npm run start:dev
```

En otra, esta UI:

```bash
cd asigna-tech-ui
node -v          # Node 24+ (CLI 21 avisa si Node 26 no está en la matriz oficial)
npm install
npm start        # ng serve → http://localhost:4200
```

Flujo: listado → Nueva solicitud → elegir **Tipo de servicio requerido** (filtra técnicos y tipos de servicio) → Guardar.

## Tests unitarios

```bash
npm test
```
