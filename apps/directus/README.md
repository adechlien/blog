# Directus local

Prueba aislada de Directus Core con PostgreSQL. No reemplaza Payload ni cambia el frontend Astro.

## Uso

1. Iniciar Docker Desktop.
2. Ejecutar `docker compose up -d` en este directorio.
3. Abrir <http://localhost:8055> y completar la creación del primer administrador.

Los datos persisten en `data/database` y `data/uploads`; ambos están excluidos de Git.

## Detener

`docker compose down` detiene los contenedores sin eliminar los datos persistidos.

No ejecutar `docker compose down --volumes` ni borrar `data/` si se quiere conservar la instancia.

