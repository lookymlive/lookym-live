# Guía de uso de MCP (Model Context Protocol)

Este documento explica cómo configurar, habilitar/deshabilitar y utilizar los MCP Servers en tu archivo `mcp_config.json`, y cómo pueden ayudarte en el desarrollo de tu aplicación.

---

## ¿Qué es un MCP?
Un MCP (Model Context Protocol) es un servidor que provee funcionalidades específicas (como acceso a archivos, búsqueda, integración con servicios externos, etc.) que puedes usar desde tu aplicación para potenciar tu flujo de desarrollo.

---

## 1. Estructura del archivo `mcp_config.json`

```json
{
  "mcpServers": {
    "mcp-installer": { ... },
    "server-filesystem": { ... },
    "context7": { ... },
    "supabase": { ... },
    "blender": { ... },
    "brave-search": { ... },
    "github": { ... }
  }
}
```
Cada entrada representa un MCP habilitado. Puedes agregar, quitar o modificar MCPs según tus necesidades.

---

## 2. ¿Cómo habilitar o deshabilitar un MCP?
- **Para habilitar:** Asegúrate de que el MCP esté presente en el objeto `mcpServers`.
- **Para deshabilitar:** Elimina la entrada del MCP del archivo o renómbrala (por ejemplo, `"npx_DISABLED"`).
- **Nota:** JSON no permite comentarios, así que no puedes comentar líneas, pero puedes mover entradas temporalmente a otro archivo para deshabilitarlas.

---

## 3. Ejemplo de configuración de un MCP

### Selección y referencia de MCP
- Puedes explorar y seleccionar MCP de distintos servidores usando [Context7 Expo](https://context7.com/expo/expo).
- Para detalles y ejemplos de configuración avanzada del MCP Context7, consulta el [repositorio oficial de Upstash Context7](https://github.com/upstash/context7).

```json
"context7": {
  "command": "npx",
  "args": ["-y", "@upstash/context7-mcp@latest"]
}
```
Si el MCP requiere variables de entorno, agrégalas así:
```json
"context7": {
  "command": "npx",
  "args": ["-y", "@upstash/context7-mcp@latest"],
  "env": {
    "CONTEXT7_API_KEY": "tu_api_key_aqui"
  }
}
```

---

## 4. ¿Cómo te ayudan los MCP en tu app?
- **Automatización:** Acceso a servicios externos (GitHub, Supabase, Brave Search, Context7, etc.) desde tu código, facilitando integraciones y automatizaciones.
- **Productividad:** Puedes consultar, modificar o buscar información de manera centralizada sin salir de tu entorno de desarrollo.
- **Escalabilidad:** Agrega o quita servicios según lo que tu app necesite en cada etapa del desarrollo.
- **Flexibilidad:** Puedes personalizar la configuración de cada MCP según tus credenciales, entorno o necesidades específicas.

---

## 5. Pasos para usar MCP en tu desarrollo
1. **Edita `mcp_config.json`** y agrega/quita los MCPs que necesitas.
2. **Configura las variables de entorno** en cada MCP si el servicio lo requiere (API keys, tokens, etc.).
3. **Guarda el archivo** y reinicia tu entorno si es necesario para recargar la configuración.
4. **Usa los comandos y servicios** habilitados desde tu app o desde la interfaz de tu entorno de desarrollo.

---

## 6. Recomendaciones
- Mantén tus tokens y claves seguras, no las compartas en repositorios públicos.
- Documenta cada MCP que uses y para qué sirve en tu proyecto.
- Si tienes dudas, revisa la documentación oficial de cada MCP o pide ayuda aquí.

---

¿Tienes dudas o necesitas ejemplos de integración específicos? ¡Pídelo y te ayudo a implementarlo!
