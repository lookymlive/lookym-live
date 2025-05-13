# Onboarding para IA Product Manager, UX/UI y Devs

Este proyecto está preparado para que cualquier IA o humano pueda continuar el desarrollo, testing, diseño o gestión del producto de forma profesional.

## Pasos iniciales recomendados

1. Lee `/docs/overview.md` para la visión general y arquitectura.
2. Consulta `/docs/development-workflow.md` para el flujo de trabajo, testing y patrones de mock.
3. Revisa `/docs/ui-components.md` para conocer los componentes UI y su uso.
4. El estado y roadmap están en `/docs/progreso-y-roadmap.md` y `/docs/3TODO.txt`.
5. El contexto técnico y decisiones clave están en `/memory-bank/`.

## Testing y calidad

- Ejecuta los tests con `npm test` o desde la tarea "Run App Tests" en VS Code.
- Los tests de stores usan mocks realistas de usuario y servicios externos (ver `/store/__tests__`).
- El patrón de mock de Zustand y usuario global está documentado en `/docs/development-workflow.md`.

## Documentación y buenas prácticas

- Actualiza siempre `/docs/ui-components.md`, `/docs/chat-implementation.md` y `/docs/development-workflow.md` al agregar features.
- Usa ejemplos de código y explica los patrones para facilitar el onboarding.

---

## Documentación del Proyecto LOOKYM

Este directorio contiene la documentación oficial del proyecto LOOKYM. Utiliza esta guía para navegar por los diferentes documentos disponibles.

## Índice de Documentación

### Documentos Principales

- [Guía de Documentación](./guia-documentacion.md) - Resumen completo del estado actual del proyecto
- [Visión General](./overview.md) - Descripción general del proyecto y sus características
- [Organización de la Documentación](./organizacion-documentacion.md) - Estructura y organización de la documentación
- [Estado del Proyecto](./PROJECT_STATUS.md) - Estado actual de desarrollo
- [Progreso y Roadmap](./progreso-y-roadmap.md) - Avances recientes y próximos pasos
- [Descripción del Proyecto](./Project_Description.txt) - Descripción detallada y contexto general
- [DOCUMENTACION.md (raíz)](../DOCUMENTACION.md) - Documento de trabajo que resume el estado actual del sistema
- [Memoria Institucional y Contexto](../memory-bank/) - Contexto, patrones, tech y progreso histórico

### Referencias Cruzadas

- Los documentos en `/memory-bank` contienen contexto institucional, patrones de sistema, progreso histórico y detalles técnicos clave. Consulta especialmente `activeContext.md`, `progress.md` y `techContext.md` para entender el estado y evolución del sistema.
- El archivo `DOCUMENTACION.md` en la raíz es el resumen vivo del sistema y debe actualizarse con cada cambio relevante.

## Relación con Otras Carpetas de Documentación

- `/memory-bank` - Contiene documentos de contexto y memoria institucional del proyecto
- `DOCUMENTACION.md` (raíz) - Documento de trabajo que resume el estado actual del sistema

## Cómo Mantener la Documentación

1. Mantén los documentos actualizados cuando implementes nuevas características o cambios importantes.
2. Sigue el formato y estilo establecido en los documentos existentes.
3. Crea nuevos documentos en la categoría apropiada cuando sea necesario y enlázalos en este índice.
4. Actualiza este índice y las referencias cruzadas cuando añadas o modifiques documentos clave.
5. Sincroniza la información relevante entre `/docs`, `/memory-bank` y `DOCUMENTACION.md` para evitar inconsistencias.
6. Si surge una nueva área de conocimiento o contexto, crea un archivo en `/memory-bank` y enlázalo aquí.

---

### Last Updated: 2025-04-16
