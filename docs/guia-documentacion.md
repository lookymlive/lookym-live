
# Guía de buenas prácticas para documentación Markdown en LOOKYM

> **IMPORTANTE para IA:**
>
> Cuando generes comentarios, documentación o archivos `.md`, **sigue SIEMPRE** las buenas prácticas de este documento. Esto es obligatorio para evitar errores de formato, redundancias y problemas de integración en el flujo de trabajo del equipo.
> **Patrón validado para IA, devs y onboarding:**

- Solo un encabezado H1 (`#`) por archivo.
- Rodea listas y encabezados con **una sola línea en blanco** antes y después.
- No dejes líneas en blanco dobles entre secciones.
- Si ves advertencias como `MD025`, `MD022`, `MD032`, revisa la estructura de encabezados y listas.
- Usa subsecciones con `##` o `###` para organización.
- Mantén la documentación y el código sincronizados.

Ejemplo correcto:

```markdown
# Título principal

## Sección

- Elemento 1
- Elemento 2

### Sub-sección

Texto aquí.
```

---

**Errores comunes a evitar:**

- Múltiples H1 (`#`) en un archivo.
- Listas o encabezados sin líneas en blanco antes/después.
- Duplicar secciones o encabezados.

Sigue este patrón en todos los archivos de `/docs`, `README.md` y documentación generada por IA.

# Guía de Documentación del Proyecto LOOKYM

## Estructura Actual del Sistema

### Sistema de Autenticación

El sistema utiliza Supabase para la autenticación de usuarios y almacenamiento de perfiles. La gestión del estado de autenticación se realiza mediante Zustand con persistencia en AsyncStorage.

**Características implementadas:**

- Registro de usuarios con email/contraseña
- Inicio de sesión con email/contraseña
- Inicio de sesión con Google (parcialmente implementado)
- Actualización de perfil de usuario
- Verificación de sesión al iniciar la aplicación

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
   - Depurar problemas conocidos

## Documentación Relacionada

Para información más detallada sobre aspectos específicos del proyecto, consulta los siguientes documentos:

- [Visión General](./overview.md) - Descripción general del proyecto
- [Configuración de Supabase](./supabase-setup.md) - Guía para configurar Supabase
- [Implementación de Chat](./chat-implementation.md) - Detalles sobre el sistema de chat
- [Gestión de Estado](./state-management.md) - Enfoque de gestión de estado con Zustand
- [Organización de la Documentación](./organizacion-documentacion.md) - Estructura de la documentación del proyecto

---

### Last Updated: 2025-04-16
