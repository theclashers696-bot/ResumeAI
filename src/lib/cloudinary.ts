import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  api_key: process.env.CLOUDINARY_API_KEY ?? "",
  api_secret: process.env.CLOUDINARY_API_SECRET ?? "",
  secure: true,
});

export { cloudinary };

export async function uploadImage(
  file: string,
  options?: {
    folder?: string;
    public_id?: string;
    transformation?: Record<string, unknown>[];
  }
) {
  if (!process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary is not configured. Please set CLOUDINARY_API_SECRET.");
  }

  const result = await cloudinary.uploader.upload(file, {
    folder: options?.folder ?? "resume-ai",
    public_id: options?.public_id,
    transformation: options?.transformation,
    overwrite: true,
    resource_type: "image",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
  };
}

export async function deleteImage(publicId: string) {
  if (!process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary is not configured. Please set CLOUDINARY_API_SECRET.");
  }
  const result = await cloudinary.uploader.destroy(publicId);
  return result;
}

export function getOptimizedUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: string | number;
    format?: string;
  }
) {
  return cloudinary.url(publicId, {
    fetch_format: options?.format ?? "auto",
    quality: options?.quality ?? "auto",
    width: options?.width,
    height: options?.height,
    crop: options?.width || options?.height ? "fill" : undefined,
    secure: true,
  });
}
