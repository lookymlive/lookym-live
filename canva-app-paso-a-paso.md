# Guía: Conectar Tu Aplicación con Canva y Convertir Código a Diseño

Esta guía explica paso a paso cómo desarrollar una aplicación para Canva, conectarla a la plataforma y convertir tu código en un diseño funcional dentro del editor de Canva.

## Requisitos Previos

Antes de comenzar, asegúrate de tener:

- Una cuenta en [Canva.com](https://www.canva.com/)
- Node.js v20.10.0 y npm v10 instalados
- Conocimientos básicos de TypeScript, React y webpack
- Git instalado en tu sistema

## Paso 1: Crear una Aplicación de Canva

1. **Instala el Canva CLI globalmente**:

   ```bash
   npm install -g @canva/cli@latest
   ```

2. **Inicia sesión en Canva CLI**:

   ```bash
   canva login
   ```

   Esto abrirá una página en tu navegador para autorizar el acceso. Haz clic en "Permitir" y copia el código de confirmación.

3. **Crea una nueva aplicación**:

   ```bash
   canva apps create "Mi Nueva App" --template="hello_world" --distribution="public" --git --installDependencies
   ```

   Puedes elegir entre estos templates:
   - `hello_world`: Plantilla mínima para empezar
   - `dam`: Plantilla para gestión de activos digitales
   - `gen_ai`: Plantilla para aplicaciones de IA generativa

## Paso 2: Configurar y Ejecutar la Aplicación

1. **Navega al directorio de la aplicación**:

   ```bash
   cd mi-nueva-app
   ```

2. **Instala las dependencias** (si no lo hiciste durante la creación):

   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo**:

   ```bash
   npm start
   ```

   Esto ejecutará tu aplicación en <http://localhost:8080>

## Paso 3: Previsualizar la Aplicación en Canva

1. Ve al [Portal de Desarrolladores de Canva](https://www.canva.com/developers/apps)
2. Navega a la página de configuración de tu aplicación
3. Selecciona **App source > Development URL**
4. Ingresa la URL del servidor de desarrollo (`http://localhost:8080`)
5. Haz clic en **Preview** para abrir la aplicación en un editor de Canva de prueba

## Paso 4: Convertir Tu Código en Diseño de Canva

Para que tu código pueda crear o modificar elementos de diseño en Canva, puedes usar el SDK de Canva. Aquí tienes ejemplos de las operaciones más comunes:

### 1. Añadir Texto a un Diseño

Abre `src/app.tsx` y modifica el código para agregar un elemento de texto:

```typescript
import { addNativeElement } from "@canva/design";

// Función para añadir texto al diseño
const addTextToDesign = () => {
  addNativeElement({
    type: "TEXT",
    textContent: "Hola desde mi aplicación",
    position: {
      x: 100,
      y: 100
    }
  });
};

// Luego vincúlalo a un botón
<Button onClick={addTextToDesign}>Añadir Texto</Button>
```

### 2. Añadir una Imagen al Diseño

Para subir y añadir una imagen desde tu aplicación:

```typescript
import { upload } from "@canva/asset";
import { addNativeElement } from "@canva/design";

const addImageToDesign = async (imageFile) => {
  try {
    // 1. Sube la imagen a Canva
    const uploadResult = await upload({
      file: imageFile,
      resourceType: "IMAGE"
    });

    // 2. Añade la imagen al diseño
    await addNativeElement({
      type: "IMAGE",
      ref: {
        resourceId: uploadResult.resourceId
      },
      position: {
        x: 100,
        y: 100
      },
      dimensions: {
        width: 300,
        height: 200
      }
    });

  } catch (error) {
    console.error("Error al subir la imagen:", error);
  }
};
```

### 3. Crear Formas

Para añadir formas al diseño:

```typescript
import { addNativeElement } from "@canva/design";

const addShapeToDesign = () => {
  addNativeElement({
    type: "SHAPE",
    shape: "SQUARE",
    position: {
      x: 100,
      y: 100
    },
    dimensions: {
      width: 200,
      height: 200
    },
    fill: {
      color: "#FF5733"
    }
  });
};
```

### 4. Modificar Elementos Existentes

Para editar elementos ya existentes en el diseño:

```typescript
import { editContent, selection } from "@canva/design";

// Escuchar cambios en la selección
selection.registerOnChange((selectedElements) => {
  if (selectedElements.length > 0 && selectedElements[0].type === "TEXT") {
    // Modificar el texto seleccionado
    editContent({
      elementId: selectedElements[0].id,
      content: "Texto modificado"
    });
  }
});
```

## Paso 5: Estilizar Tu Aplicación con App UI Kit

Canva proporciona un kit de UI para que tu aplicación tenga un aspecto coherente con la plataforma:

```typescript
import { 
  Box, 
  Button, 
  Text, 
  Title, 
  Grid, 
  ImageCard 
} from "@canva/app-ui-kit";

// Ejemplo de un componente con UI Kit
const MyComponent = () => {
  return (
    <Box padding="2u">
      <Title>Mi Aplicación</Title>
      <Text>Selecciona una imagen:</Text>
      <Grid columns={3} spacing="1u">
        <ImageCard 
          alt="Imagen 1" 
          thumbnailUrl="https://ejemplo.com/imagen1.jpg" 
          onClick={() => handleImageSelect("imagen1")}
        />
        <ImageCard 
          alt="Imagen 2" 
          thumbnailUrl="https://ejemplo.com/imagen2.jpg" 
          onClick={() => handleImageSelect("imagen2")}
        />
      </Grid>
      <Button variant="primary" onClick={addToDesign}>
        Añadir al Diseño
      </Button>
    </Box>
  );
};
```

## Paso 6: Publicar Tu Aplicación

Una vez que hayas desarrollado tu aplicación, puedes publicarla siguiendo estos pasos:

1. **Prepara tu aplicación para producción**:

   ```bash
   npm run build
   ```

2. **Sube la aplicación a un servidor web** (o usa servicios como Netlify, Vercel, etc.)

3. **Configura la URL de producción**:
   - En el Portal de Desarrolladores, ve a la configuración de tu aplicación
   - Actualiza la URL de la aplicación con la dirección de tu versión de producción

4. **Envía tu aplicación para revisión** (para distribución pública):
   - Completa toda la información requerida (descripción, capturas, etc.)
   - Envía la aplicación para revisión
   - Espera la aprobación por parte del equipo de Canva

## Consejos Adicionales

- **Prueba en diferentes contextos**: Tu aplicación debe funcionar bien tanto en diseños de documentos como de presentaciones o redes sociales.
- **Piensa en la usabilidad**: Sigue las directrices de diseño de Canva para crear una experiencia familiar para los usuarios.
- **Documentación**: Revisa la [documentación oficial de Canva para desarrolladores](https://www.canva.dev/docs/apps/) cuando tengas dudas específicas.

## Solución de Problemas Comunes

- **La aplicación no se carga**: Verifica que la URL de desarrollo sea correcta y que el servidor esté en ejecución.
- **Los elementos no se añaden al diseño**: Asegúrate de tener los permisos correctos configurados en tu aplicación.
- **Errores CORS**: Si integras con un backend, configura adecuadamente los encabezados CORS.

## Recursos Útiles

- [Documentación del SDK de Canva](https://www.canva.dev/docs/apps/)
- [Kit de inicio para aplicaciones](https://github.com/canva-sdks/canva-apps-sdk-starter-kit)
- [Comunidad de desarrolladores de Canva](https://community.canva.dev/)
