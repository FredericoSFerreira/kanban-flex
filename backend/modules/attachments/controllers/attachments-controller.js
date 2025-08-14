import {uploadFileToS3, deleteFileFromS3, generatePresignedUrl} from '../../../service/s3-service.js';
import {callFunction} from '../../../utils/parse-utils.js';
import dotenv from 'dotenv';
import {pipeline} from 'stream';
import {promisify} from 'util';

const pump = promisify(pipeline);


dotenv.config();

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 2 * 1024 * 1024; // 2MB in bytes
const MAX_TOTAL_USER_SIZE = parseInt(process.env.MAX_TOTAL_USER_SIZE) || 10 * 1024 * 1024; // 10MB in bytes

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
const ALLOWED_FILE_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];

/**
 * Upload a file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadFile = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({success: false, message: 'No file uploaded'});
    }

    const file = req.file;
    const {boardId, itemId} = req.body;
    const userId = req.user.id;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return res.status(400).json({
        success: false,
        message: `File size exceeds the limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      });
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'File type not supported. Allowed types: JPEG, JPG, PNG, WEBP, PDF, DOC, DOCX, XLSX'
      });
    }

    // Check user's total upload size
    const userAttachments = await callFunction('getUserAttachments', {userId}, req.token);
    const totalUserSize = userAttachments.reduce((sum, attachment) => sum + attachment.size, 0);

    if (totalUserSize + file.size > MAX_TOTAL_USER_SIZE) {
      return res.status(400).json({
        success: false,
        message: `Total upload size exceeds the limit of ${MAX_TOTAL_USER_SIZE / (1024 * 1024)}MB`
      });
    }

    // Upload file to S3
    const fileUrl = await uploadFileToS3(file.buffer, file.originalname, file.mimetype);

    // Create attachment record
    const attachment = {
      name: file.originalname,
      url: fileUrl,
      size: file.size,
      type: file.mimetype,
      isImage: ALLOWED_IMAGE_TYPES.includes(file.mimetype),
      userId,
      boardId,
      itemId,
      createdAt: new Date().toISOString()
    };

    // Save attachment to database
    const result = await callFunction('createAttachment', {attachment}, req.token);

    res.status(200).json({
      success: true,
      attachment: result
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file'
    });
  }
};

/**
 * Get attachments for an item
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getItemAttachments = async (req, res) => {
  try {
    const {itemId} = req.params;

    // Get attachments from database
    const attachments = await callFunction('getItemAttachments', {itemId}, req.token);

    res.status(200).json({
      success: true,
      attachments
    });
  } catch (error) {
    console.error('Error getting attachments:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting attachments'
    });
  }
};

/**
 * Delete an attachment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteAttachment = async (req, res) => {
  try {
    const {attachmentId} = req.params;
    const userId = req.user.id;

    // Get attachment from database
    const attachment = await callFunction('getAttachment', {attachmentId}, req.token);

    // Check if attachment exists
    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    // Check if user is authorized to delete the attachment
    if (attachment.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this attachment'
      });
    }

    // Delete file from S3
    await deleteFileFromS3(attachment.url);

    // Delete attachment from database
    await callFunction('deleteAttachment', {attachmentId}, req.token);

    res.status(200).json({
      success: true,
      message: 'Attachment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting attachment'
    });
  }
};

/**
 * Get user's total upload size
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserUploadSize = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's attachments
    const userAttachments = await callFunction('getUserAttachments', {userId}, req.token);
    const totalSize = userAttachments.reduce((sum, attachment) => sum + attachment.size, 0);

    res.status(200).json({
      success: true,
      totalSize,
      maxSize: MAX_TOTAL_USER_SIZE,
      remainingSize: MAX_TOTAL_USER_SIZE - totalSize
    });
  } catch (error) {
    console.error('Error getting user upload size:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user upload size'
    });
  }
};


const downloadAttachment = async (req, res) => {
  try {
    const {attachmentId} = req.params;
    const userId = req.user.id;

    const attachment = await callFunction('getAttachment', {attachmentId}, req.token);

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    if (attachment.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this attachment'
      });
    }

    const url = await generatePresignedUrl(attachment.url);

    res.status(200).json({
      success: true,
      url: url
    });
  } catch (error) {
    console.error('Error download attachment:', error);
    res.status(500).json({
      success: false,
      message: 'Error download attachment'
    });
  }
}

export {uploadFile, getItemAttachments, deleteAttachment, getUserUploadSize, downloadAttachment};
