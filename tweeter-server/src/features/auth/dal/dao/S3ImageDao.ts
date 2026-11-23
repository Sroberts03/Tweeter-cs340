import { ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { IImageDao } from "../interface/IImageDao";

/**
 * AWS S3 implementation of IImageDao.
 * Uploads user profile images to Amazon S3 with public-read permissions.
 */
export class S3ImageDao implements IImageDao {
  private readonly bucket: string;
  private readonly region: string;
  private readonly client: S3Client;

  public constructor(
    bucket: string = process.env.IMAGE_BUCKET || "srober29-cs340-sam",
    region: string = process.env.AWS_REGION || "us-east-1"
  ) {
    this.bucket = bucket;
    this.region = region;
    this.client = new S3Client({ region: this.region });
  }

  public async putImage(
    fileName: string,
    imageStringBase64Encoded: string,
    imageFileExtension: string = "png"
  ): Promise<string> {
    if (!fileName?.trim() || !imageStringBase64Encoded?.trim()) {
      throw new Error("[Bad Request] Image file name and base64 content are required");
    }

    const cleanExtension = imageFileExtension.replace(/^\./, "").toLowerCase();
    const contentType = `image/${cleanExtension === "jpg" ? "jpeg" : cleanExtension}`;
    const key = `image/${fileName}`;

    const decodedImageBuffer: Buffer = Buffer.from(
      imageStringBase64Encoded,
      "base64"
    );

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: decodedImageBuffer,
      ContentType: contentType,
      ACL: ObjectCannedACL.public_read,
    });

    try {
      await this.client.send(command);
      return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    } catch (error) {
      throw new Error(`[Internal Server Error] S3 put image failed with: ${error}`);
    }
  }
}
