import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const checkEnvVars = () => {
  const required = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required R2 environment variables: ${missing.join(', ')}`);
  }
};

const getR2Client = () => {
  checkEnvVars();

  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
};

export const uploadToR2 = async (
  file: Buffer,
  fileName: string,
  type: 'background' | 'voiceover',
  contentType: string = 'audio/mpeg'
): Promise<string> => {
  const r2Client = getR2Client();
  const key = `${type}/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await r2Client.send(command);
  return key;
};

export const listFilesFromR2 = async (type?: 'background' | 'voiceover') => {
  const r2Client = getR2Client();
  const prefix = type ? `${type}/` : '';

  const command = new ListObjectsV2Command({
    Bucket: process.env.R2_BUCKET_NAME,
    Prefix: prefix,
  });

  const response = await r2Client.send(command);
  return response.Contents || [];
};

export const deleteFromR2 = async (key: string): Promise<void> => {
  const r2Client = getR2Client();
  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  });

  await r2Client.send(command);
};

export const getPresignedUrl = async (key: string): Promise<string> => {
  const r2Client = getR2Client();
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  });

  // URL valid for 1 hour
  const url = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
  return url;
};
