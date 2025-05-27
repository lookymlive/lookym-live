# Product Context

* **Problem Solved:** Addresses the lack of engaging video content and direct communication channels on traditional business discovery platforms. Users want richer visual info (video) before buying, and businesses need better ways to showcase than static images/text.
* **Intended Workflow:**
  1. Businesses upload short, high-quality videos of their storefronts, products, or services.
  2. Users browse a discovery feed (like window shopping), search, or filter to find relevant businesses/content.
  3. Users watch videos, interact (like, save).
  4. Users initiate direct chat with businesses for inquiries or potential orders.
  5. Both users and businesses manage their profiles.
* **User Experience Goals:** Engaging, visually appealing, intuitive, efficient discovery, seamless communication, modern, replicates the feeling of window shopping.
* **Key Use Cases:**
  1. A user discovers a local boutique through its video showcasing a new collection and messages the store directly to ask about sizing.
  2. A restaurant uploads a video highlighting its ambiance and special dish, attracting new customers who save the video.
  3. A user searches for "handmade jewelry near me" and finds local artisans through their video profiles.
* **Success Metrics:** User acquisition/retention, business onboarding/activity, video engagement (views, likes, saves), message initiation/response rates, user-to-business conversions (visits, inquiries).

## Contexto de Producto: LOOKYM

## Wireframes Básicos (Markdown)

### A. Login / Registro

```psh
+-----------------------------+
|         LOOKYM Logo         |
|-----------------------------|
|  [ Email                ]   |
|  [ Contraseña           ]   |
|  ( ) Usuario   ( ) Comercio |
|                             |
|  [ Ingresar ]  [ Registrar ]|
+-----------------------------+
```

### B. Feed de Vidrieras

```psh
+-----------------------------+
|  [Logo Tienda]  Nombre      |
|  [Ubicación]                |
|-----------------------------|
|   [   Video autoplay   ]    |
|   [ Etiqueta: Zapatilla ]   |
|   [ Etiqueta: Reloj    ]    |
|-----------------------------|
| [Seguir] [Guardar] [Perfil] |
+-----------------------------+
|  <Siguiente video...>       |
```

### C. Detalle de Producto

```psh
+-----------------------------+
|   [ Imagen/Video Producto ] |
|-----------------------------|
| Nombre: Zapatilla Nike      |
| Precio: $100                |
| Descripción: ...            |
|-----------------------------|
| [Guardar] [Comprar] [Chat]  |
+-----------------------------+
```

### D. Perfil de Comercio

```psh
+-----------------------------+
| [Logo] Nombre Tienda        |
| Descripción breve           |
|-----------------------------|
| [Seguir] [Chat]             |
|-----------------------------|
| Historial de Vidrieras:     |
|  - [Video 1] [Video 2] ...  |
+-----------------------------+
```

### E. Perfil de Usuario

```psh
+-----------------------------+
| [Foto] Nombre Usuario       |
|-----------------------------|
| Favoritos:                  |
|  - [Producto 1] [2] ...     |
|-----------------------------|
| Historial de Interacciones  |
| Configuración               |
+-----------------------------+
```

### F. Chat

```psh
+-----------------------------+
| [Tienda X]                  |
|-----------------------------|
| Hola, ¿tienes talle 42?     |
| Sí, disponible.             |
|-----------------------------|
| [Escribir mensaje...] [> ]  |
+-----------------------------+
```

### G. Notificaciones

```psh
+-----------------------------+
| Notificaciones              |
|-----------------------------|
| Nueva vidriera: Tienda X    |
| Mensaje nuevo: Tienda Y     |
+-----------------------------+
```

---

## User Flow Visual (Markdown)

```psh
[Inicio/Login]
      |
      v
[Registro (elige rol)]
      |
      v
[Feed de Vidrieras] <-------------------+
  |         |         |                 |
  v         v         v                 |
[Ver Tag] [Perfil] [Buscar]             |
  |         |                           |
  v         v                           |
[Detalle] [Perfil Comercio]             |
  |         |                           |
  v         v                           |
[Guardar] [Chat]                        |
  |                                     |
  v                                     |
[Notificaciones] <----------------------+
```

---

## Checklist de Funcionalidades MVP

* [ ] Registro/login con rol (usuario/comercio)
* [ ] Feed de videos de vidrieras (scroll, autoplay, sin descarga)
* [ ] Etiquetas interactivas sobre productos en video
* [ ] Detalle de producto (ver info, guardar, comprar, chatear)
* [ ] Perfil de comercio (info, historial de vidrieras)
* [ ] Perfil de usuario (favoritos, historial)
* [ ] Chat básico usuario-comercio
* [ ] Notificaciones simples

---

## Paso a paso para prototipar en Figma (y conectar contexto MCP)

1. **Crea un nuevo archivo en Figma** y nómbralo "LOOKYM MVP".
2. **Crea un frame para cada pantalla** siguiendo los wireframes de arriba:
   * Login/Registro
   * Feed de Vidrieras
   * Detalle de Producto
   * Perfil de Comercio
   * Perfil de Usuario
   * Chat
   * Notificaciones
3. **Usa componentes reutilizables** para botones, campos de texto, tarjetas de producto, etc.
4. **Agrega interacciones simples** (por ejemplo, al tocar una etiqueta en el video, mostrar el detalle del producto).
5. **Comparte el prototipo con el equipo** para feedback y validación.
6. **(Opcional) Conexión con contexto MCP:**
   * Si tienes acceso a un modelo MCP (Model Context Platform) o integración AI, exporta los wireframes o el user flow como imágenes o PDF.
   * Sube el archivo a la plataforma MCP o usa la API para conectar el contexto visual y funcional.
   * Documenta en la plataforma el objetivo, flujo y funcionalidades clave usando el resumen de este archivo.
7. **Itera según feedback** antes de pasar a desarrollo.

---

> Esta documentación sirve como guía visual y funcional para el equipo de producto, diseño y desarrollo. Actualiza este archivo con nuevas pantallas, flujos o decisiones importantes para mantener alineado al equipo.
