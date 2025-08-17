import {S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

const endpoint = process.env.S3_ENDPOINT;
const env = process.env.NODE_ENV === 'production' ? 'prod' : 'hml';
// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  endpoint: endpoint,
  forcePathStyle: true
});

const bucketName = process.env.AWS_S3_BUCKET;

/**
 * Upload a file to S3
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} fileName - The file name
 * @param {string} contentType - The file content type
 * @returns {Promise<string>} - The URL of the uploaded file
 */
export const uploadFileToS3 = async (fileBuffer, fileName, contentType) => {
  try {
    // Create a unique file name to avoid collisions
    const key = `${env}/${Date.now()}-${fileName.toLowerCase().replace(/\s+/g, '_')}`;

    // Set up the upload parameters
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType
    };


    // Upload the file
    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    // Generate a URL for the file
    const url = `https://${bucketName}.${process.env.AWS_REGION}.magaluobjects.com/${key}`;

    return url;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};

/**
 * Delete a file from S3
 * @param {string} fileUrl - The URL of the file to delete
 * @returns {Promise<void>}
 */
export const deleteFileFromS3 = async (fileUrl) => {
  try {
    // Extract the key from the URL
    const key = fileUrl.split('/').pop();

    // Set up the delete parameters
    const params = {
      Bucket: bucketName,
      Key: `${env}/${key}`
    };

    // Delete the file
    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
};

/**
 * Generate a pre-signed URL for a file in S3
 * @param fileUrl
 * @param {number} expiresIn - The number of seconds until the URL expires
 * @returns {Promise<string>} - The pre-signed URL
 */
export const generatePresignedUrl = async (fileUrl, expiresIn = 3600) => {
  try {

   const key = fileUrl.split('/').pop();

    const params = {
      Bucket: bucketName,
      Key: `${env}/${key}`
    };

    const command = new GetObjectCommand(params);
    return  await getSignedUrl(s3Client, command, {expiresIn});

  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    throw error;
  }
};
