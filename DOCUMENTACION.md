# Documentación del Proyecto Lookym Live

> **Actualizado:** 19 de mayo de 2025

## Resumen Ejecutivo

LOOKYM es una plataforma móvil que conecta usuarios con negocios a través de contenido de video de formato corto. La aplicación permite a los negocios mostrar sus productos y servicios, mientras que los usuarios pueden descubrir, interactuar y comunicarse directamente con estos negocios.

**Estado actual:** Fase de desarrollo activo con funcionalidades core implementadas y en proceso de refinamiento.

## Estructura Actual del Sistema

### Sistema de Autenticación

El sistema utiliza Supabase para la autenticación de usuarios y almacenamiento de perfiles. La gestión del estado de autenticación se realiza mediante Zustand con persistencia en AsyncStorage.

**Características implementadas:**

- Registro de usuarios con email/contraseña
- Inicio de sesión con email/contraseña
- Inicio de sesión con Google (parcialmente implementado)
- Actualización de perfil de usuario
- Verificación de sesión al iniciar la aplicación
- Roles diferenciados (usuario/negocio)

### Sistema de Notificaciones

Implementado con Zustand y conectado a Supabase para almacenar y recuperar notificaciones.

**Tipos de notificaciones soportadas:**

- Nuevos seguidores (`new_follower`)
- Me gusta en videos (`video_like`)
- Nuevos comentarios (`new_comment`)
- Nuevos mensajes (`new_message`)

**Funcionalidades:**

- Recuperación de notificaciones desde Supabase
- Marcado de notificaciones como leídas (individual y masivo)
- Conteo de notificaciones no leídas
- Navegación contextual según el tipo de notificación

### Sistema de Chat

Actualmente implementado con datos simulados (mock data) y almacenamiento local.

**Funcionalidades:**

- Visualización de conversaciones
- Envío de mensajes
- Creación de nuevas conversaciones
- Marcado de mensajes como leídos

## Redundancias y Áreas de Mejora

### Redundancias Identificadas

1. **Navegación duplicada:** Existen dos archivos para la gestión de chat (`chat/[id].tsx` y `chat/[userId].tsx`) con funcionalidades superpuestas.

2. **Gestión de estado inconsistente:** El sistema de chat utiliza datos simulados mientras que el sistema de notificaciones está conectado a Supabase.

3. **Componentes UI duplicados:** Existen patrones de UI similares en diferentes pantallas que podrían extraerse como componentes reutilizables.

### Mejoras Propuestas

#### 1. Integración completa con Supabase

- Migrar el sistema de chat para utilizar Supabase en lugar de datos simulados
- Implementar suscripciones en tiempo real para notificaciones y mensajes
- Completar la integración con autenticación de Google

#### 2. Refactorización de la navegación

- Unificar la navegación de chat en un solo archivo
- Mejorar la integración entre notificaciones y chat

#### 3. Componentes reutilizables

- Crear componentes para elementos comunes como:
  - Avatares de usuario
  - Indicadores de carga
  - Mensajes de estado vacío
  - Cabeceras de sección

#### 4. Tipado estricto

- Reemplazar el uso de `any` con tipos específicos
- Mejorar la definición de interfaces para entidades del sistema

## Mejoras Recientes (Mayo 2025)

### 1. Sistema de Testing Mejorado

- Se han corregido los tests del componente `FollowButton` utilizando técnicas más robustas para testing de componentes React Native
- Se ha creado documentación detallada sobre las mejores prácticas para testing en `components/__tests__/README.md`
- Se ha implementado un enfoque más confiable para seleccionar componentes en tests usando `UNSAFE_getAllByType` en lugar de `getByRole`
- Se han eliminado tests redundantes y consolidado la funcionalidad en archivos de test principales

### 2. Organización de la Documentación

- Se ha reorganizado la documentación relacionada con Canva en `docs/canva/`
- Se ha actualizado la documentación de testing con las mejores prácticas actuales
- Se ha mejorado la estructura del proyecto siguiendo las mejores prácticas de Expo para desarrollo web y móvil

### 3. Optimización de Código

- Se han eliminado archivos redundantes y código no utilizado
- Se ha mejorado la organización de componentes y tests
- Se han aplicado mejores prácticas para importaciones en TypeScript

## Próximas Tareas

1. **Integración de chat con Supabase**
   - Crear tablas necesarias en Supabase
   - Implementar funciones para gestionar conversaciones y mensajes
   - Añadir suscripciones en tiempo real

2. **Unificación de la navegación de chat**
   - Consolidar la lógica en un solo archivo
   - Mejorar la experiencia de usuario al navegar entre notificaciones y chat

3. **Mejora del perfil de usuario**
   - Completar la implementación del perfil
   - Añadir funcionalidad para seguir/dejar de seguir usuarios
   - Implementar edición de perfil

4. **Optimización de rendimiento**
   - Implementar paginación para listas largas
   - Mejorar la gestión de caché
   - Optimizar el uso de imágenes y recursos

5. **Pruebas y depuración**
   - Añadir pruebas unitarias para componentes clave
   - Implementar pruebas de integración
   - Depurar problemas conocidos.

## Resultados de los tests y estado del sistema (14/05/2025)

### Ejecución de tests

Se ejecutaron los tests automáticos del proyecto con el comando `npm test`.

**Resumen de resultados:**

- Total de suites de test: 5
- Suites exitosas: 4
- Suites fallidas: 1
- Total de tests: 15
- Tests exitosos: 13
- Tests fallidos: 2

**Principales errores detectados:**

- Fallos en el componente `FollowButton` (posible error de exportación o importación incorrecta, revisar si el componente está correctamente exportado/importado y si se usan correctamente los imports default/named).
- Errores en la lógica de Cloudinary (uso de `startsWith` sobre un valor `undefined` o no string, revisar validación de tipos en la función que sube videos a Cloudinary).

**Recomendaciones inmediatas:**

- Revisar y corregir la exportación/importación del componente `FollowButton`.
- Validar los tipos de datos antes de usar métodos como `startsWith` en la lógica de Cloudinary.
- Repetir los tests tras corregir los errores para asegurar que todo el sistema funcione correctamente.

### Cómo correr los tests

1. Asegúrate de tener las dependencias instaladas:

   ```sh
   npm install
   ```

2. Ejecuta los tests:

   ```sh
   npm test
   ```

   O usa la tarea de VS Code "Run App Tests".

### Notas adicionales

- Los tests cubren stores, componentes y utilidades clave.
- Se recomienda mantener y ampliar la cobertura de tests a medida que se agregan nuevas funcionalidades.
- Documenta cualquier cambio relevante en `/docs/development-workflow.md` y en este archivo.

---

## Guía para Equipos

### Para el AI Product Manager

1. **Estado actual:** El proyecto está en fase de desarrollo activo con las funcionalidades core implementadas.
2. **Prioridades recomendadas:**
   - Completar la integración de chat con Supabase
   - Finalizar la autenticación con Google
   - Implementar notificaciones push
3. **Documentación clave:**
   - `/docs/progreso-y-roadmap.md` para el roadmap completo
   - `/docs/3TODO.txt` para tareas pendientes específicas
   - `/memory-bank/` para decisiones clave y contexto técnico
   - `/docs/PROJECT_STATUS_UPDATED.md` para el estado actual detallado

### Para el Equipo de UI/UX

1. **Componentes disponibles:**
   - Consultar `/docs/ui-components.md` para ver los componentes existentes
   - El sistema de diseño está implementado en componentes reutilizables
2. **Áreas de mejora:**
   - Experiencia de chat
   - Flujo de subida de videos
   - Perfil de negocio
3. **Documentación clave:**
   - `/components/README.md` para entender la estructura de componentes
   - `/docs/styling-guide.md` para guías de estilo

### Para Desarrolladores

1. **Configuración del entorno:**
   - Seguir las instrucciones en el README principal
   - Ejecutar `npm install` y `npm start` para iniciar el proyecto
2. **Arquitectura:**
   - Expo Router para navegación
   - Zustand para gestión de estado
   - Supabase para backend
3. **Testing:**
   - Seguir las mejores prácticas en `components/__tests__/README.md`
   - Ejecutar `npm test` para correr los tests
4. **Documentación clave:**
   - `/docs/development-workflow.md` para el flujo de trabajo
   - `/docs/architecture.md` para entender la arquitectura
   - `/docs/authentication.md` para el sistema de autenticación
   - `/docs/video-system.md` para el sistema de videos

## Recomendaciones para Desarrollo

- Seguir las convenciones de TypeScript y mantener el tipado estricto.
- Mantener la estructura modular del proyecto.
- Documentar nuevas funcionalidades y componentes.
- Escribir tests para nuevas funcionalidades siguiendo las mejores prácticas documentadas.
- Mantener y ampliar la cobertura de tests a medida que se agregan nuevas funcionalidades.
- Documentar cualquier cambio relevante en `/docs/development-workflow.md` y en este archivo.

---
