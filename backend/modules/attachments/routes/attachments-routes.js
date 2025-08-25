import express from 'express';
import multer from 'multer';
import { uploadFile, getItemAttachments, deleteAttachment, getUserUploadSize, downloadAttachment, getUserAttachments } from '../controllers/attachments-controller.js';
import { verifyToken } from '../../../middleware/auth.js';

const storage = multer.memoryStorage();
const upload = multer({ storage });

const attachmentsRouter = express.Router();

attachmentsRouter.post('/attachments/upload', verifyToken, upload.single('file'), uploadFile);

attachmentsRouter.get('/attachments/item/:itemId', verifyToken, getItemAttachments);

attachmentsRouter.delete('/attachments/:attachmentId', verifyToken, deleteAttachment);

attachmentsRouter.get('/attachments/:attachmentId/download', verifyToken, downloadAttachment);

attachmentsRouter.get('/attachments/user/size', verifyToken, getUserUploadSize);

attachmentsRouter.get('/attachments/user', verifyToken, getUserAttachments);

export default attachmentsRouter;
