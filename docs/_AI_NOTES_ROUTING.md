## 2025-05-22: Corrección de mapeo snake_case a camelCase en videos

Se detectó y corrigió un error en el método `fetchVideoById` del store de videos, donde se accedía a `data.videoUrl` y `data.thumbnailUrl` en vez de mapear correctamente desde `data.video_url` y `data.thumbnail_url` (formato snake_case de Supabase).

Ahora, todos los métodos del store de videos mapean correctamente los campos a camelCase, garantizando consistencia en la UI y evitando errores de visualización en la pantalla de perfil y otros componentes.

Revisar y mantener esta convención en futuras integraciones de datos externos.
# Notas de IA: Resolución de conflictos de rutas en Expo Router

## Problema detectado

Expo Router no permite que dos rutas resuelvan al mismo path. Se detectó el siguiente conflicto:

- `app/(tabs)/chat.tsx`
- `app/(tabs)/chat/index.tsx`

Ambos archivos resuelven a la ruta `/chat`, lo que genera el error:

```psh
Found conflicting screens with the same pattern. The pattern '(tabs)/chat' resolves to both '(tabs) > chat/index' and '(tabs) > chat'. Patterns must be unique and cannot resolve to more than one screen.
```

## Solución aplicada

- Se elimina el archivo `app/(tabs)/chat.tsx` y se deja únicamente `app/(tabs)/chat/index.tsx` como entrypoint de la ruta `/chat`.
- Se documenta este patrón para futuras automatizaciones y para que la IA priorice siempre la versión `index.tsx` en caso de conflicto.

## Recomendación para futuras automatizaciones

- **Nunca deben coexistir archivos `foo.tsx` y carpetas `foo/index.tsx` en el mismo nivel de rutas.**
- Si ambos existen, priorizar y mantener solo la versión `index.tsx`.
- Documentar en este archivo cualquier decisión de routing relevante para la IA y el equipo.

---

Última actualización: 2025-05-22
Responsable: GitHub Copilot (IA)
