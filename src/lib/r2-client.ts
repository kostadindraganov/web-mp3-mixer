import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_BUCKET_NAME) {
  throw new Error('Missing required R2 environment variables');
}

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export const uploadToR2 = async (
  file: Buffer,
  fileName: string,
  type: 'background' | 'voiceover'
): Promise<string> => {
  const key = `${type}/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: 'audio/mpeg',
  });

  await r2Client.send(command);
  return key;
};

export const listFilesFromR2 = async (type?: 'background' | 'voiceover') => {
  const prefix = type ? `${type}/` : '';

  const command = new ListObjectsV2Command({
    Bucket: process.env.R2_BUCKET_NAME,
    Prefix: prefix,
  });

  const response = await r2Client.send(command);
  return response.Contents || [];
};

export const deleteFromR2 = async (key: string): Promise<void> => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  });

  await r2Client.send(command);
};

export const getPresignedUrl = async (key: string): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  });

  // URL valid for 1 hour
  const url = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
  return url;
};

export { r2Client };
