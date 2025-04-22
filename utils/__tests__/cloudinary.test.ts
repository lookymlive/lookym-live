// Mock de expo-constants para evitar errores en Node
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {
        cloudinaryCloudName: 'test-cloud',
        cloudinaryUploadPreset: 'test-preset',
      },
    },
  },
}));

// Mock de react-native para evitar errores en Node
jest.mock('react-native', () => ({
  Alert: { alert: jest.fn() },
}));

// Mock global fetch y FormData para entorno Node
beforeAll(() => {
  global.fetch = jest.fn((...args) => {
    // Simula una respuesta exitosa de Cloudinary
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({ secure_url: 'https://cloudinary.com/fake-url.mp4', public_id: 'fake_public_id' }),
      text: async () => '',
      blob: async () => new Blob(["test"], { type: "video/mp4" })
    });
  }) as any;
});
if (!global.FormData) {
  global.FormData = class {
    append() {}
  } as any;
}

import { uploadVideo } from '../cloudinary';
import { buildCloudinaryFormData } from '../cloudinary-logic';

describe('buildCloudinaryFormData', () => {
  it('should build FormData with correct fields', () => {
    const file = new Blob(["test"], { type: "video/mp4" });
    const formData = buildCloudinaryFormData(file, 'preset', { resource_type: 'video', folder: 'test', public_id: 'id', tags: ['a', 'b'] });
    // No hay API directa para leer FormData en Node, pero podemos testear que no arroja errores
    expect(formData).toBeInstanceOf(FormData);
  });
});

describe('uploadVideo', () => {
  it('should throw error if videoUri is missing', async () => {
    // @ts-expect-error
    await expect(uploadVideo()).rejects.toThrow();
  });

  it('should throw error if videoUri is not a string', async () => {
    // @ts-expect-error
    await expect(uploadVideo(123)).rejects.toThrow();
  });

  it('should create FormData and call fetch for web URIs', async () => {
    const videoUri = 'https://example.com/video.mp4';
    const formDataAppend = jest.spyOn(global.FormData.prototype, 'append');
    await uploadVideo(videoUri, { resource_type: 'video' });
    expect(formDataAppend).toHaveBeenCalledWith('file', expect.any(Blob));
    formDataAppend.mockRestore();
  });

  // Puedes agregar más tests para onProgress, errores de Cloudinary, etc.
});
