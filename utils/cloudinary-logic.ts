// Lógica pura y helpers para Cloudinary (sin dependencias nativas)

export interface CloudinaryOptions {
  resource_type?: string;
  folder?: string;
  public_id?: string;
  tags?: string[];
}

export function buildCloudinaryFormData(
  file: Blob | { uri: string; type: string; name: string },
  uploadPreset: string,
  options: CloudinaryOptions = {}
) {
  const formData = new FormData();
  // Detecta si es un objeto nativo de RN o un Blob (web)
  if (typeof (file as any).uri === 'string') {
    // @ts-ignore: FormData de RN acepta objeto con uri
    formData.append("file", file);
  } else {
    formData.append("file", file as Blob);
  }
  formData.append("upload_preset", uploadPreset);
  if (options.resource_type) formData.append("resource_type", options.resource_type);
  if (options.folder) formData.append("folder", options.folder);
  if (options.public_id) formData.append("public_id", options.public_id);
  if (options.tags && options.tags.length > 0) formData.append("tags", options.tags.join(","));
  return formData;
}

