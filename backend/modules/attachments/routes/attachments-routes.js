import express from 'express';
import multer from 'multer';
import { uploadFile, getItemAttachments, deleteAttachment, getUserUploadSize, downloadAttachment, getUserAttachments } from '../controllers/attachments-controller.js';
import { verifyToken } from '../../../middleware/auth.js';

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

const attachmentsRouter = express.Router();

// Upload a file
attachmentsRouter.post('/attachments/upload', verifyToken, upload.single('file'), uploadFile);

// Get attachments for an item
attachmentsRouter.get('/attachments/item/:itemId', verifyToken, getItemAttachments);

// Delete an attachment
attachmentsRouter.delete('/attachments/:attachmentId', verifyToken, deleteAttachment);

attachmentsRouter.get('/attachments/:attachmentId/download', verifyToken, downloadAttachment);

// Get user's total upload size
attachmentsRouter.get('/attachments/user/size', verifyToken, getUserUploadSize);

// Get user's attachments with optional search
attachmentsRouter.get('/attachments/user', verifyToken, getUserAttachments);

export default attachmentsRouter;
