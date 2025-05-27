# LOOKYM: Vidriera Digital Interactiva

## Idea Principal

LOOKYM es una plataforma social que digitaliza la experiencia de mirar vidrieras de comercios, permitiendo a los usuarios explorar videos cortos de escaparates de tiendas (ropa, zapatos, relojes, etc.) como si pasearan por una calle comercial. Los comercios suben videos de sus vidrieras, destacando productos con etiquetas interactivas (tags) que muestran detalles como nombre, precio y características. Los usuarios pueden interactuar con estos productos (ver detalles, guardar, elegir, comprar o consultar), pero no pueden descargar los videos, asegurando que el contenido siempre sea fresco y renovable con cada cambio de vidriera.

### Objetivo

- Simular la experiencia real de "mirar vidrieras" en una app moderna y visual.
- Facilitar el descubrimiento de productos y tiendas de forma entretenida y directa.
- Permitir a los comercios renovar su escaparate digital fácilmente, manteniendo a los usuarios siempre actualizados.

### Flujo de Experiencia

1. **Comercio sube video de su vidriera**: El video muestra productos destacados, cada uno con su etiqueta/tag interactiva.
2. **Usuario navega el feed de vidrieras**: Ve videos de diferentes tiendas, toca etiquetas para ver detalles y puede elegir, guardar o comprar productos.
3. **Renovación constante**: Los videos se actualizan con cada cambio de vidriera; los usuarios siempre ven lo último.
4. **Interacción social y comercial**: Seguir tiendas, recibir notificaciones, chatear para consultas, etc.

### Diferenciadores Clave

- Simulación auténtica de la experiencia de "mirar vidrieras".
- Videos efímeros y renovables, no descargables.
- Etiquetas interactivas sobre los productos en el video.
- Foco en el descubrimiento y la experiencia, no solo en la compra.

### MVP Básico

- Feed de videos de vidrieras (scroll vertical, autoplay, sin descarga)
- Etiquetas interactivas sobre el video
- Perfiles de comercio y usuario
- Guardar producto, comprar o chatear
- Renovación fácil de vidrieras
- Notificaciones de nuevas vidrieras

## Project Brief

- **Project Name:** LOOKYM
- **Core Goal:** Connect users with businesses through short-form video content, allowing businesses to showcase storefronts/products and users to discover, interact, and communicate directly.
- **Key Features:**
- Video Content Upload & Discovery (Business uploads, User browsing/search)
- Direct Messaging (In-app chat between users and businesses)
- Authentication (Secure user/business roles, email/pass, Google OAuth)
- Profile Management (Customizable user and business profiles)
- Search & Discovery Features
- **Target Audience:**
- **Users:** Shoppers seeking visual discovery of local businesses/products, preferring video and direct communication.
- **Businesses:** Retailers, local stores, service providers wanting an engaging way to showcase their offerings via video.
- **High-Level Requirements:**
- Cross-platform mobile application (iOS, Android) built with React Native/Expo.
- Backend services provided by Supabase (Authentication, Database, Realtime).
- Video hosting and streaming via Cloudinary.
- Real-time chat functionality.
- **Scope Boundaries:** (Initially)
- No in-app e-commerce purchasing.
- No integrated booking system.
- Limited initial analytics for businesses.
- No loyalty programs or location-based push notifications at launch.
