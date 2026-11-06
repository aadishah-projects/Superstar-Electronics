import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function requiredEnvironmentVariable(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getR2Config() {
  return {
    accountId: requiredEnvironmentVariable("CLOUDFLARE_R2_ACCOUNT_ID"),
    bucketName: requiredEnvironmentVariable("R2_BUCKET_NAME"),
    endpoint: requiredEnvironmentVariable("R2_ENDPOINT"),
    accessKeyId: requiredEnvironmentVariable("R2_ACCESS_KEY_ID"),
    secretAccessKey: requiredEnvironmentVariable("R2_SECRET_ACCESS_KEY"),
  };
}

export function hasR2Config() {
  return [
    "CLOUDFLARE_R2_ACCOUNT_ID",
    "R2_BUCKET_NAME",
    "R2_ENDPOINT",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
  ].every((name) => Boolean(process.env[name]));
}

export function shouldUseR2Attachments() {
  const configuredMode = process.env.PORTAL_ATTACHMENT_STORAGE;
  if (configuredMode === "local") return false;
  if (configuredMode === "r2") return true;
  return hasR2Config();
}

let r2Client: S3Client | undefined;

export function getR2BucketName() {
  return getR2Config().bucketName;
}

export function getR2Client() {
  if (!r2Client) {
    const config = getR2Config();
    r2Client = new S3Client({
      region: "auto",
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  return r2Client;
}

export async function verifyR2BucketAccess() {
  const bucketName = getR2BucketName();
  await getR2Client().send(new HeadBucketCommand({ Bucket: bucketName }));
}

export async function putPrivateR2Object(input: {
  key: string;
  body: Uint8Array;
  contentType: string;
}) {
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: getR2BucketName(),
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
      ContentLength: input.body.byteLength,
    }),
  );
}

export async function getPrivateR2Object(key: string) {
  const response = await getR2Client().send(
    new GetObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
    }),
  );

  if (!response.Body) {
    return null;
  }

  const body = await response.Body.transformToByteArray();
  return {
    body,
    contentType: response.ContentType ?? "application/octet-stream",
    contentLength: response.ContentLength ?? body.byteLength,
  };
}

export async function deletePrivateR2Object(key: string) {
  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
    }),
  );
}

export function buildR2AttachmentKey(input: {
  kind: "tickets" | "jobs";
  entityId: string;
  attachmentId: string;
  extension: string;
}) {
  const extension = input.extension.replace(/[^a-zA-Z0-9.]/g, "").slice(0, 10);
  return `${input.kind}/${input.entityId}/${input.attachmentId}${extension}`;
}

export function markR2StoredName(key: string) {
  return `r2:${key}`;
}

export function getR2KeyFromStoredName(storedName: string) {
  return storedName.startsWith("r2:") ? storedName.slice(3) : null;
}
