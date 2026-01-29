## SGED Frontend

### Seguridad (sesión y token)

- Autenticación **stateless** con JWT.
- Token almacenado en `sessionStorage`.
- No se usa `localStorage` ni cookies de sesión.
- CSRF deshabilitado en backend al usar JWT en header `Authorization`.
