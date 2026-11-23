/**
 * Database-agnostic interface for image storage.
 * Supports profile image uploads needed by AuthService (register).
 */
export interface IImageDao {
  /**
   * Upload an image and return its public URL.
   *
   * @param fileName                   Name to store the image under
   * @param imageStringBase64Encoded   The image data as a base64-encoded string
   * @param imageFileExtension         File extension (e.g. "png", "jpg")
   * @returns The public URL of the uploaded image.
   */
  putImage(
    fileName: string,
    imageStringBase64Encoded: string,
    imageFileExtension: string
  ): Promise<string>;
}
