# LOOKYM – QA Checklist (UI Refactor)

> **Instrucciones:**
>
> - Usa esta checklist antes de cada release o después de cambios importantes en la UI.
> - Marca cada casilla `[x]` cuando la verifiques.
> - Agrega notas o issues encontrados en la sección de comentarios al final.

---

## 1. General Visual Consistency

- ✅ Todos los headers usan `AppHeader` y se ven consistentes en todas las pantallas.
- ✅ Los estados de loading, vacío y error usan `FullScreenStatusView` (con iconos y mensajes claros).
- ✅ Las listas de usuarios usan `AppListItem` (avatar, nombre, subtítulo, trailing button).
- ✅ Los grids de videos usan `MediaGridItem` (thumbnail, título, onPress).
- ✅ Las barras de acción usan `ActionBar` (iconos, contadores, feedback visual).
- ✅ Los perfiles de usuario usan `UserInfo` para mostrar avatar, nombre y detalles.
- ✅ Los colores, tipografías y espaciados son coherentes en web y móvil.

## 2. Funcionalidad de Pantallas Clave

### Seguidores / Following

- ✅ El header muestra el título correcto y el botón de volver funciona.
- ✅ El estado loading aparece correctamente al cargar la lista.
- ✅ El estado vacío aparece si no hay seguidores/seguidos.
- ✅ El botón de seguir/siguiendo funciona y actualiza el estado visual.
- ✅ Al tocar un usuario, navega correctamente a su perfil.

### Perfil

- ✅ El header muestra el nombre de usuario y los botones de editar/settings según corresponda.
- ✅ El estado loading aparece al cargar el perfil.
- ✅ El estado error aparece si falla la carga.
- ✅ El grid de videos muestra los videos correctamente usando `MediaGridItem`.
- ✅ El botón de editar perfil, seguir, mensaje y logout funcionan y tienen feedback visual.
- ✅ Las estadísticas de seguidores/seguidos se actualizan correctamente.

### Video

- ✅ El header muestra el título y el botón de volver funciona.
- ✅ El estado loading aparece al cargar el video.
- ✅ El estado error aparece si falla la carga o la sesión expira.
- ✅ El usuario del video se muestra con `UserInfo` y navega a su perfil al tocarlo.
- ✅ La barra de acciones (`ActionBar`) permite like, guardar, compartir, comentar, y refleja el estado activo.
- ✅ Los comentarios se muestran y pueden agregarse correctamente.

## 3. Responsive y Accesibilidad

- [ ] La UI se adapta bien a diferentes tamaños de pantalla (web y móvil).
- [ ] Los botones y áreas táctiles son suficientemente grandes.
- [ ] Los textos tienen buen contraste y son legibles.
- [ ] Los iconos y feedback visual son claros.

## 4. Errores y Estados Límite

- ✅ No hay referencias rotas ni errores de import.
- ✅ Los estados de error y vacío son amigables y no muestran mensajes técnicos.
- ✅ No hay duplicación de componentes legacy en las pantallas migradas.

## 5. Pruebas de Navegación

- ✅ Navegar entre pantallas no produce glitches visuales.
- ✅ El botón de volver siempre regresa a la pantalla anterior esperada.
- ✅ Los enlaces a perfiles, videos y chats funcionan correctamente.

## 6. Pruebas de Usuario

- [ ] Prueba con un usuario logueado y uno no logueado.
- [ ] Prueba con usuarios con y sin seguidores/seguidos.
- [ ] Prueba con perfiles con y sin videos.

---

## Comentarios / Issues encontrados

- [ ] ...
- [ ] ...
