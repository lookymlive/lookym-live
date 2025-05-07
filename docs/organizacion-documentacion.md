# Organización de la Documentación en LOOKYM

## Estructura de Documentación

El proyecto LOOKYM mantiene su documentación en dos carpetas principales:

### 1. Carpeta `/docs`

Contiene la documentación oficial y técnica del proyecto, organizada por temas específicos:

- **Documentos de Visión General**:
  - `overview.md` - Descripción general del proyecto
  - `README.md` - Índice de la documentación
  - `Project_Description.txt` - Descripción detallada del proyecto
  - `PROJECT_STATUS.md` - Estado actual del proyecto
  - `progreso-y-roadmap.md` - Progreso y plan de desarrollo

- **Documentos Técnicos**:
  - `architecture.md` - Arquitectura del sistema
  - `supabase-setup.md` - Configuración de Supabase
  - `state-management.md` - Gestión de estado con Zustand
  - `chat-implementation.md` - Implementación del sistema de chat
  - `video-system.md` - Sistema de gestión de videos
  - `authentication.md` - Sistema de autenticación
  - `google-auth-setup.md` - Configuración de autenticación con Google
  - `external-services.md` - Integración con servicios externos

- **Guías de Desarrollo**:
  - `development-workflow.md` - Flujo de trabajo de desarrollo
  - `styling-guide.md` - Guía de estilo y UI
  - `ui-components.md` - Componentes de UI disponibles
  - `configuration.md` - Configuración del entorno
  - `CONTRIBUTING.md` - Guía de contribución al proyecto
  - `CODE_OF_CONDUCT.md` - Código de conducta

- **Planificación**:
  - `1idea.md`, `2plan.md`, `3TODO.txt` - Documentos de planificación inicial

### 2. Carpeta `/memory-bank`

Contiene documentos de contexto y memoria institucional del proyecto, útiles para nuevos desarrolladores y para mantener el conocimiento del proyecto:

- `projectbrief.md` - Resumen ejecutivo del proyecto
- `techContext.md` - Contexto tecnológico detallado
- `systemPatterns.md` - Patrones de diseño y arquitectura utilizados
- `progress.md` - Historial detallado de progreso
- `activeContext.md` - Contexto activo de desarrollo
- `productContext.md` - Contexto del producto y visión

## Relación con DOCUMENTACION.md

El archivo `DOCUMENTACION.md` en la raíz del proyecto sirve como un documento de trabajo que resume el estado actual del sistema, identifica redundancias y áreas de mejora, y lista las próximas tareas. Este documento es complementario a la documentación más detallada en las carpetas `/docs` y `/memory-bank`.

## Cómo Utilizar la Documentación

1. **Para nuevos desarrolladores**:
   - Comienza con el `README.md` principal
   - Revisa `docs/overview.md` para entender el proyecto
   - Consulta `memory-bank/techContext.md` para el contexto tecnológico
   - Sigue con `docs/development-workflow.md` para entender el flujo de trabajo

2. **Para desarrolladores actuales**:
   - Consulta `DOCUMENTACION.md` para ver el estado actual y próximas tareas
   - Utiliza los documentos específicos en `/docs` según el área en la que estés trabajando
   - Mantén actualizado `memory-bank/progress.md` con los avances realizados

3. **Para contribuciones**:
   - Sigue las pautas en `docs/CONTRIBUTING.md`
   - Asegúrate de que cualquier nueva funcionalidad esté documentada en el lugar apropiado
   - Actualiza `DOCUMENTACION.md` cuando se completen tareas o se identifiquen nuevas áreas de mejora

## Mantenimiento de la Documentación

Para mantener la documentación actualizada y útil:

1. Actualiza los documentos relevantes cuando implementes nuevas características o realices cambios significativos
2. Revisa periódicamente `DOCUMENTACION.md` para asegurarte de que refleja el estado actual del proyecto
3. Mantén `memory-bank/progress.md` actualizado con los avances del proyecto
4. Cuando completes tareas de la lista en `DOCUMENTACION.md`, actualiza el documento para reflejarlo

---

### Última actualización: 2025-04-16
