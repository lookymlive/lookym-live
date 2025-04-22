# LOOKYM

LOOKYM es una plataforma móvil que conecta usuarios y negocios a través de videos cortos.

---

# [EN] Recent Updates
- The bottom navigation tab previously labeled 'Create' is now 'Upload' for clarity.
- The Home screen now fetches the latest videos automatically when opened.
- The upload flow now returns the new video and provides a direct link to view it after successful upload.

See documentation for more details.


## Documentación principal
Toda la documentación se encuentra en la carpeta `/docs`. Consulta el archivo `overview.md` o este mismo README para empezar.

---

## Testing en proyectos Expo/React Native

La configuración de testing está optimizada para proyectos con Expo y React Native usando Jest, Babel y TypeScript:

### Configuración base
- Usa `babel-jest` como transformador principal para `.ts` y `.tsx`.
- Archivo de configuración: `jest.config.cjs` (CommonJS, compatible con Babel y ESM en el código fuente).
- Babel configurado en `babel.config.cjs`.

### Mocks recomendados
Mockea módulos nativos y externos en tu archivo `jest.setup.ts`:
```ts
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { extra: { cloudinaryCloudName: 'test', cloudinaryUploadPreset: 'test' } } },
}));
jest.mock('react-native', () => ({}));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
```

### Buenas prácticas
- Mockea `fetch` y otros servicios de red en los tests que lo requieran.
- Separa la lógica pura en módulos independientes para facilitar el testing.
- Evita dependencias reales de red o de módulos nativos en los tests.

### Ejemplo de test unitario robusto
```ts
import { uploadVideo } from '../utils/cloudinary';

describe('uploadVideo', () => {
  beforeAll(() => {
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({ secure_url: 'fake-url', public_id: 'fake_id' }),
      text: async () => '',
      blob: async () => new Blob(["test"], { type: "video/mp4", lastModified: Date.now() })
    }));
  });
  it('should create FormData and call fetch for web URIs', async () => {
    const videoUri = 'https://example.com/video.mp4';
    await uploadVideo(videoUri, { resource_type: 'video' });
    expect(global.fetch).toHaveBeenCalled();
  });
});
```

Para más detalles revisa los tests en `/utils/__tests__/` y `/store/__tests__/`.

## Estructura del proyecto
- Código fuente: `/app`, `/components`, `/utils`, etc.
- Documentación: `/docs`
- Recursos estáticos: `/assets`

## Primeros pasos
1. Instala dependencias: `npm install`
2. Corre el proyecto: `npm start` (Expo)

## Enlaces útiles
- [Guía de desarrollo](./guides/development.md)
- [Estado del proyecto](./PROJECT_STATUS.md)
- [Contribuir](./CONTRIBUTING.md)

---

Para más detalles, revisa los archivos dentro de `/docs`.
