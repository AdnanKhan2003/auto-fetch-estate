import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.AWS_REGION!;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID!;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!;
const bucketName = process.env.AWS_S3_BUCKET_NAME!;

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export async function uploadScreenshotToS3(
  fileBuffer: Buffer,
  filename: string,
  mimeType: string = "image/png",
): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: filename,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);
}

export async function getPresignedScreenshotUrl(
  filename: string,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: filename,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
