# Guía para Invocar Herramientas Canva MCP

Las herramientas Canva MCP (Multi-Client Plugin) son controladas por LLMs y no pueden ser invocadas directamente por usuarios. Esta guía explica cómo solicitar información de estas herramientas a través de un agente LLM.

## Herramientas Disponibles

Estas son las principales herramientas Canva MCP disponibles:

1. **Documentación Canva Apps SDK**
   - Contiene información sobre el desarrollo de aplicaciones en Canva
   - Incluye guías, referencias de API y ejemplos

2. **Documentación Canva Connect**
   - Recursos para construir integraciones Connect en Canva
   - APIs, autenticación y mejores prácticas

3. **Catálogo de Componentes App UI Kit**
   - Componentes UI disponibles en el paquete `@canva/app-ui-kit`
   - 44 componentes principales con múltiples variaciones

4. **Catálogo de Patrones UI Kit**
   - Patrones UI comunes y mejores prácticas
   - Combina múltiples componentes para crear patrones reutilizables

5. **Documentación CLI de Canva**
   - Instrucciones para usar el CLI de Canva
   - Comandos como login, creación de apps, vista previa, etc.

6. **Guías de Diseño Apps SDK**
   - Directrices de diseño para publicar apps en Canva
   - Recursos UI, accesibilidad, internacionalización

## Cómo Solicitar Información

Para acceder a estas herramientas a través de un agente LLM, utiliza estas estrategias:

1. **Incluye palabras clave específicas** en tus consultas:
   - "App UI Kit", "Apps SDK", "Canva Connect", "Canva CLI"
   - Ejemplo: "¿Qué componentes están disponibles en el App UI Kit de Canva?"

2. **Solicita documentación específica**:
   - Ejemplo: "Muéstrame la documentación sobre autenticación en Canva Connect"
   - Ejemplo: "Necesito información sobre los patrones UI en el UI Kit de Canva"

3. **Haz preguntas directas sobre funcionalidades**:
   - Ejemplo: "¿Cómo puedo implementar un selector de color en una app de Canva?"
   - Ejemplo: "¿Cuáles son las mejores prácticas para el diseño de apps en Canva?"

4. **Solicita ejemplos de código**:
   - Ejemplo: "Muéstrame un ejemplo de cómo usar el componente Button en el UI Kit"
   - Ejemplo: "¿Cómo implementar un grid de imágenes con el App UI Kit?"

## Ejemplos de Consultas Efectivas

```psh
"¿Cuántos componentes hay en el App UI Kit de Canva?"

"Necesito información sobre cómo implementar la autenticación en una app de Canva"

"Muéstrame la documentación sobre cómo crear un patrón de Surface Header en Canva"

"¿Cuáles son las directrices de accesibilidad para apps de Canva?"

"Necesito ejemplos de código para implementar un selector de archivos en Canva"
```

## Consejos Adicionales

- Sé específico en tus consultas para obtener respuestas más precisas
- Para documentación técnica detallada, menciona explícitamente qué parte necesitas
- Si necesitas código, especifica el lenguaje y contexto de uso
- Para componentes UI, puedes solicitar variaciones específicas o ejemplos de implementación

Recuerda que el agente consultará las herramientas MCP apropiadas basándose en tu consulta y te proporcionará la información relevante.
