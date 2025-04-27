# Lookym Live - Guía de procesos y desarrollo

Esta guía documenta los pasos clave para implementar y mantener las funcionalidades principales del proyecto, incluyendo perfiles de negocio, dashboard, subida de videos y búsqueda.

---

## 1. Estructura de carpetas relevante

- `app/(tabs)/profile.tsx` — Pantalla de perfil de usuario/negocio
- `app/edit-profile.tsx` — Pantalla para editar perfil
- `app/business-dashboard.tsx` — Dashboard para cuentas de negocio
- `app/(tabs)/upload.tsx` — Subida de videos
- `app/(tabs)/search.tsx` — Búsqueda de videos
- `types/user.ts` — Definición del tipo User
- `types/video.ts` — Definición del tipo Video
- `utils/cloudinary.ts` — Utilidades para subida de videos

---

## 2. Perfil de usuario y negocio

### a) Campos necesarios en el modelo User

Agrega los siguientes campos en `types/user.ts`:

```ts
export interface User {
  ...
  category?: string; // Solo para negocios
  location?: string; // Solo para negocios
}
```

### b) Edición de perfil

- Implementa la pantalla `edit-profile.tsx` con campos editables (nombre, bio, categoría, ubicación).
- El botón "Editar perfil" en `profile.tsx` debe navegar a `/edit-profile`.

### c) Dashboard de negocio

- Crea la pantalla `business-dashboard.tsx` para mostrar estadísticas y funciones de negocio.
- El botón "Business Dashboard" en `profile.tsx` debe navegar a `/business-dashboard`.

---

## 3. Subida de videos

### a) Utilidad de subida

- Usa `uploadVideo` en `utils/cloudinary.ts` para subir videos a Cloudinary.
- Soporta progreso en tiempo real usando `XMLHttpRequest`.

### b) Pantalla de subida

- En `upload.tsx`, muestra barra de progreso y preview del video antes de subir.
- Solo usuarios autenticados pueden subir videos.

---

## 4. Búsqueda de videos

### a) Pantalla de búsqueda

- Implementa en `search.tsx` con un `TextInput` y una lista de resultados en tiempo real.
- Filtra videos por `caption` y `hashtags`.
- Usa el store `useVideoStore` para obtener videos (`fetchVideos`).

---

## 5. Consideraciones de backend

- Asegúrate de que los campos nuevos (`category`, `location`) estén en la base de datos y API.
- El endpoint de videos debe devolver `caption`, `hashtags`, `thumbnailUrl` y `id`.

---

## 6. Mejoras y testing

- Prueba todas las pantallas en web y móvil.
- Añade manejo de errores y feedback visual (ej: alertas, loaders).
- Si necesitas más funcionalidades, documenta cada nuevo paso aquí.

---

## 7. Recursos útiles

- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Supabase Docs](https://supabase.com/docs)

---

## 8. Contacto y soporte

Si tienes que empezar de nuevo:

1. Sigue el orden de esta guía.
2. Revisa los tipos y pantallas creados.
3. Asegúrate de que el backend soporte todos los campos y endpoints necesarios.

---

Actualiza este README cada vez que agregues nuevas funciones o modifiques procesos clave.
