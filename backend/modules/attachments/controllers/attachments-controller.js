import {uploadFileToS3, deleteFileFromS3, generatePresignedUrl} from '../../../service/s3-service.js';
import {callFunction} from '../../../utils/parse-utils.js';
import dotenv from 'dotenv';


dotenv.config();

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 2 * 1024 * 1024; // 2MB in bytes

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
    if (!req.file) {
      return res.status(400).json({success: false, message: 'No file uploaded'});
    }

    const file = req.file;
    const {boardId, itemId} = req.body;
    const userId = req.user.id;

    if (file.size > MAX_FILE_SIZE) {
      return res.status(400).json({
        success: false,
        message: `File size exceeds the limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      });
    }

    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'File type not supported. Allowed types: JPEG, JPG, PNG, WEBP, PDF, DOC, DOCX, XLSX'
      });
    }

    const userAttachments = await callFunction('getUserAttachments', {userId}, req.token);
    const totalUserSize = userAttachments.reduce((sum, attachment) => sum + attachment.size, 0);

    // Get user's storage limit from OTP collection
    const userData = await callFunction('getUserMe', {id: userId}, req.token);
    const userStorageLimit = userData.limitStorage || (10 * 1024 * 1024); // Default 10MB if not set

    if (totalUserSize + file.size > userStorageLimit) {
      return res.status(400).json({
        success: false,
        message: `Total upload size exceeds the limit of ${userStorageLimit / (1024 * 1024)}MB`
      });
    }

    const fileUrl = await uploadFileToS3(file.buffer, file.originalname, file.mimetype);

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

    const attachment = await callFunction('getAttachment', {attachmentId}, req.token);

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    await deleteFileFromS3(attachment.url);
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

    const userAttachments = await callFunction('getUserAttachments', {userId}, req.token);
    const totalSize = userAttachments.reduce((sum, attachment) => sum + attachment.size, 0);

    const userData = await callFunction('getUserMe', {id: userId}, req.token);
    const userStorageLimit = userData.limitStorage || (10 * 1024 * 1024); // Default 10MB if not set

    res.status(200).json({
      success: true,
      totalSize,
      maxSize: userStorageLimit,
      remainingSize: userStorageLimit - totalSize
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

    const attachment = await callFunction('getAttachment', {attachmentId}, req.token);

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
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

/**
 * Get all user's attachments with optional search
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserAttachments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search } = req.query;

    // Get user's attachments with optional search
    const attachments = await callFunction('getUserAttachments', {
      userId,
      search: search || undefined
    }, req.token);

    res.status(200).json({
      success: true,
      attachments
    });
  } catch (error) {
    console.error('Error getting user attachments:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user attachments'
    });
  }
};

export {uploadFile, getItemAttachments, deleteAttachment, getUserUploadSize, downloadAttachment, getUserAttachments};
