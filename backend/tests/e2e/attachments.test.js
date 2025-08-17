const mockCallFunction = jest.fn();
const mockUploadFileToS3 = jest.fn();
const mockDeleteFileFromS3 = jest.fn();
const mockGeneratePresignedUrl = jest.fn();

jest.unstable_mockModule('./service/s3-service.js', () => ({
  uploadFileToS3: mockUploadFileToS3,
  deleteFileFromS3: mockDeleteFileFromS3,
  generatePresignedUrl: mockGeneratePresignedUrl
}));

jest.unstable_mockModule('./utils/parse-utils.js', () => ({
  callFunction: mockCallFunction
}));

jest.unstable_mockModule('./middleware/auth.js', () => ({
  verifyToken: (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({msg: 'Token not pass'});
    }

    req.user = {id: 'mock-user-id', name: 'Mock User'};
    req.token = 'fake-token';
    next();
  }
}));

const request = (await import('supertest')).default;
const {default: app} = await import('../../app.js');

// Mock data
const mockAttachment = {
  id: 'attachment1',
  name: 'test-file.jpg',
  url: 'https://bucket.s3.amazonaws.com/hml/123456789-test-file.jpg',
  size: 1024000, // 1MB
  type: 'image/jpeg',
  isImage: true,
  userId: 'mock-user-id',
  boardId: 'board1',
  itemId: 'item1',
  createdAt: new Date().toISOString()
};

const mockUserAttachments = [
  {
    id: 'attachment1',
    size: 1024000 // 1MB
  },
  {
    id: 'attachment2',
    size: 2048000 // 2MB
  }
];

const mockItemAttachments = [
  mockAttachment,
  {
    id: 'attachment2',
    name: 'document.pdf',
    url: 'https://bucket.s3.amazonaws.com/hml/123456789-document.pdf',
    size: 512000,
    type: 'application/pdf',
    isImage: false,
    userId: 'mock-user-id',
    boardId: 'board1',
    itemId: 'item1',
    createdAt: new Date().toISOString()
  }
];

describe('Attachments Endpoints', () => {
  beforeEach(() => {
    mockCallFunction.mockReset();
    mockUploadFileToS3.mockReset();
    mockDeleteFileFromS3.mockReset();
    mockGeneratePresignedUrl.mockReset();
  });

  describe('POST /attachments/upload', () => {
    it('should upload a file successfully', async () => {
      const fileBuffer = Buffer.from('test file content');
      const mockS3Url = 'https://bucket.s3.amazonaws.com/hml/123456789-test-file.jpg';

      mockCallFunction.mockResolvedValueOnce([]); // getUserAttachments returns empty array
      mockUploadFileToS3.mockResolvedValueOnce(mockS3Url);
      mockCallFunction.mockResolvedValueOnce(mockAttachment); // createAttachment

      const response = await request(app)
        .post('/attachments/upload')
        .set('Authorization', 'Bearer fake-token')
        .field('boardId', 'board1')
        .field('itemId', 'item1')
        .attach('file', fileBuffer, {
          filename: 'test-file.jpg',
          contentType: 'image/jpeg'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.attachment).toEqual(mockAttachment);

      expect(mockCallFunction).toHaveBeenCalledWith('getUserAttachments', {userId: 'mock-user-id'}, 'fake-token');
      expect(mockUploadFileToS3).toHaveBeenCalledWith(expect.any(Buffer), 'test-file.jpg', 'image/jpeg');
      expect(mockCallFunction).toHaveBeenCalledWith('createAttachment', {
        attachment: expect.objectContaining({
          name: 'test-file.jpg',
          url: mockS3Url,
          type: 'image/jpeg',
          isImage: true,
          userId: 'mock-user-id',
          boardId: 'board1',
          itemId: 'item1'
        })
      }, 'fake-token');
    });

    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app)
        .post('/attachments/upload')
        .set('Authorization', 'Bearer fake-token')
        .field('boardId', 'board1')
        .field('itemId', 'item1');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('No file uploaded');

      expect(mockCallFunction).not.toHaveBeenCalled();
      expect(mockUploadFileToS3).not.toHaveBeenCalled();
    });

    it('should return 400 when file size exceeds limit', async () => {
      const largeFileBuffer = Buffer.alloc(3 * 1024 * 1024); // 3MB

      const response = await request(app)
        .post('/attachments/upload')
        .set('Authorization', 'Bearer fake-token')
        .field('boardId', 'board1')
        .field('itemId', 'item1')
        .attach('file', largeFileBuffer, {
          filename: 'large-file.jpg',
          contentType: 'image/jpeg'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('File size exceeds the limit of 2MB');

      expect(mockCallFunction).not.toHaveBeenCalled();
      expect(mockUploadFileToS3).not.toHaveBeenCalled();
    });

    it('should return 400 when file type is not allowed', async () => {
      const fileBuffer = Buffer.from('test file content');

      const response = await request(app)
        .post('/attachments/upload')
        .set('Authorization', 'Bearer fake-token')
        .field('boardId', 'board1')
        .field('itemId', 'item1')
        .attach('file', fileBuffer, {
          filename: 'test-file.txt',
          contentType: 'text/plain'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('File type not supported. Allowed types: JPEG, JPG, PNG, WEBP, PDF, DOC, DOCX, XLSX');

      expect(mockCallFunction).not.toHaveBeenCalled();
      expect(mockUploadFileToS3).not.toHaveBeenCalled();
    });

    it('should return 400 when total user size exceeds limit', async () => {
      const fileBuffer = Buffer.alloc(2 * 1024 * 1024); // 2MB file

      // Mock user already has 9MB of files
      mockCallFunction.mockResolvedValueOnce([
        {id: 'att1', size: 5 * 1024 * 1024}, // 5MB
        {id: 'att2', size: 4 * 1024 * 1024}  // 4MB
      ]);

      const response = await request(app)
        .post('/attachments/upload')
        .set('Authorization', 'Bearer fake-token')
        .field('boardId', 'board1')
        .field('itemId', 'item1')
        .attach('file', fileBuffer, {
          filename: 'test-file.jpg',
          contentType: 'image/jpeg'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Total upload size exceeds the limit of 10MB');

      expect(mockCallFunction).toHaveBeenCalledWith('getUserAttachments', {userId: 'mock-user-id'}, 'fake-token');
      expect(mockUploadFileToS3).not.toHaveBeenCalled();
    });

    it('should return 401 when not authenticated', async () => {
      const fileBuffer = Buffer.from('test file content');

      const response = await request(app)
        .post('/attachments/upload')
        .field('boardId', 'board1')
        .field('itemId', 'item1')
        .attach('file', fileBuffer, {
          filename: 'test-file.jpg',
          contentType: 'image/jpeg'
        });

      expect(response.status).toBe(401);
      expect(response.body.msg).toBe('Token not pass');

      expect(mockCallFunction).not.toHaveBeenCalled();
      expect(mockUploadFileToS3).not.toHaveBeenCalled();
    });

    it('should return 500 when upload to S3 fails', async () => {
      const fileBuffer = Buffer.from('test file content');

      mockCallFunction.mockResolvedValueOnce([]); // getUserAttachments
      mockUploadFileToS3.mockRejectedValueOnce(new Error('S3 upload failed'));

      const response = await request(app)
        .post('/attachments/upload')
        .set('Authorization', 'Bearer fake-token')
        .field('boardId', 'board1')
        .field('itemId', 'item1')
        .attach('file', fileBuffer, {
          filename: 'test-file.jpg',
          contentType: 'image/jpeg'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error uploading file');

      expect(mockUploadFileToS3).toHaveBeenCalled();
    });

    it('should return 500 when database operation fails', async () => {
      const fileBuffer = Buffer.from('test file content');
      const mockS3Url = 'https://bucket.s3.amazonaws.com/hml/123456789-test-file.jpg';

      mockCallFunction.mockResolvedValueOnce([]); // getUserAttachments
      mockUploadFileToS3.mockResolvedValueOnce(mockS3Url);
      mockCallFunction.mockRejectedValueOnce(new Error('Database error')); // createAttachment fails

      const response = await request(app)
        .post('/attachments/upload')
        .set('Authorization', 'Bearer fake-token')
        .field('boardId', 'board1')
        .field('itemId', 'item1')
        .attach('file', fileBuffer, {
          filename: 'test-file.jpg',
          contentType: 'image/jpeg'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error uploading file');
    });
  });

  describe('GET /attachments/item/:itemId', () => {
    it('should return attachments for an item successfully', async () => {
      mockCallFunction.mockResolvedValueOnce(mockItemAttachments);

      const response = await request(app)
        .get('/attachments/item/item1')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.attachments).toEqual(mockItemAttachments);

      expect(mockCallFunction).toHaveBeenCalledWith('getItemAttachments', {itemId: 'item1'}, 'fake-token');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/attachments/item/item1');

      expect(response.status).toBe(401);
      expect(response.body.msg).toBe('Token not pass');

      expect(mockCallFunction).not.toHaveBeenCalled();
    });

    it('should return 500 when database error occurs', async () => {
      mockCallFunction.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .get('/attachments/item/item1')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error getting attachments');

      expect(mockCallFunction).toHaveBeenCalledWith('getItemAttachments', {itemId: 'item1'}, 'fake-token');
    });
  });

  describe('DELETE /attachments/:attachmentId', () => {
    it('should delete attachment successfully', async () => {
      mockCallFunction.mockResolvedValueOnce(mockAttachment); // getAttachment
      mockDeleteFileFromS3.mockResolvedValueOnce();
      mockCallFunction.mockResolvedValueOnce(); // deleteAttachment

      const response = await request(app)
        .delete('/attachments/attachment1')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Attachment deleted successfully');

      expect(mockCallFunction).toHaveBeenCalledWith('getAttachment', {attachmentId: 'attachment1'}, 'fake-token');
      expect(mockDeleteFileFromS3).toHaveBeenCalledWith(mockAttachment.url);
      expect(mockCallFunction).toHaveBeenCalledWith('deleteAttachment', {attachmentId: 'attachment1'}, 'fake-token');
    });

    it('should return 404 when attachment not found', async () => {
      mockCallFunction.mockResolvedValueOnce(null); // getAttachment returns null

      const response = await request(app)
        .delete('/attachments/nonexistent')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Attachment not found');

      expect(mockCallFunction).toHaveBeenCalledWith('getAttachment', {attachmentId: 'nonexistent'}, 'fake-token');
      expect(mockDeleteFileFromS3).not.toHaveBeenCalled();
    });

    it('should return 403 when user is not authorized', async () => {
      const unauthorizedAttachment = {
        ...mockAttachment,
        userId: 'different-user-id'
      };

      mockCallFunction.mockResolvedValueOnce(unauthorizedAttachment);

      const response = await request(app)
        .delete('/attachments/attachment1')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Not authorized to delete this attachment');

      expect(mockDeleteFileFromS3).not.toHaveBeenCalled();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .delete('/attachments/attachment1');

      expect(response.status).toBe(401);
      expect(response.body.msg).toBe('Token not pass');

      expect(mockCallFunction).not.toHaveBeenCalled();
    });

    it('should return 500 when S3 deletion fails', async () => {
      mockCallFunction.mockResolvedValueOnce(mockAttachment); // getAttachment
      mockDeleteFileFromS3.mockRejectedValueOnce(new Error('S3 delete failed'));

      const response = await request(app)
        .delete('/attachments/attachment1')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error deleting attachment');

      expect(mockDeleteFileFromS3).toHaveBeenCalledWith(mockAttachment.url);
    });

    it('should return 500 when database deletion fails', async () => {
      mockCallFunction.mockResolvedValueOnce(mockAttachment); // getAttachment
      mockDeleteFileFromS3.mockResolvedValueOnce();
      mockCallFunction.mockRejectedValueOnce(new Error('Database error')); // deleteAttachment fails

      const response = await request(app)
        .delete('/attachments/attachment1')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error deleting attachment');
    });
  });

  describe('GET /attachments/user/size', () => {
    it('should return user upload size successfully', async () => {
      const totalSize = mockUserAttachments.reduce((sum, att) => sum + att.size, 0);
      mockCallFunction.mockResolvedValueOnce(mockUserAttachments);

      const response = await request(app)
        .get('/attachments/user/size')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.totalSize).toBe(totalSize);
      expect(response.body.maxSize).toBe(10 * 1024 * 1024); // 10MB
      expect(response.body.remainingSize).toBe(10 * 1024 * 1024 - totalSize);

      expect(mockCallFunction).toHaveBeenCalledWith('getUserAttachments', {userId: 'mock-user-id'}, 'fake-token');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/attachments/user/size');

      expect(response.status).toBe(401);
      expect(response.body.msg).toBe('Token not pass');

      expect(mockCallFunction).not.toHaveBeenCalled();
    });

    it('should return 500 when database error occurs', async () => {
      mockCallFunction.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .get('/attachments/user/size')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error getting user upload size');

      expect(mockCallFunction).toHaveBeenCalledWith('getUserAttachments', {userId: 'mock-user-id'}, 'fake-token');
    });
  });

  describe('GET /attachments/:attachmentId/download', () => {
    it('should return download URL successfully', async () => {
      const mockPresignedUrl = 'https://presigned-url.s3.amazonaws.com/file';

      mockCallFunction.mockResolvedValueOnce(mockAttachment); // getAttachment
      mockGeneratePresignedUrl.mockResolvedValueOnce(mockPresignedUrl);

      const response = await request(app)
        .get('/attachments/attachment1/download')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.url).toBe(mockPresignedUrl);

      expect(mockCallFunction).toHaveBeenCalledWith('getAttachment', {attachmentId: 'attachment1'}, 'fake-token');
      expect(mockGeneratePresignedUrl).toHaveBeenCalledWith(mockAttachment.url);
    });

    it('should return 404 when attachment not found', async () => {
      mockCallFunction.mockResolvedValueOnce(null); // getAttachment returns null

      const response = await request(app)
        .get('/attachments/nonexistent/download')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Attachment not found');

      expect(mockCallFunction).toHaveBeenCalledWith('getAttachment', {attachmentId: 'nonexistent'}, 'fake-token');
      expect(mockGeneratePresignedUrl).not.toHaveBeenCalled();
    });

    it('should return 403 when user is not authorized', async () => {
      const unauthorizedAttachment = {
        ...mockAttachment,
        userId: 'different-user-id'
      };

      mockCallFunction.mockResolvedValueOnce(unauthorizedAttachment);

      const response = await request(app)
        .get('/attachments/attachment1/download')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Not authorized to delete this attachment');

      expect(mockGeneratePresignedUrl).not.toHaveBeenCalled();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/attachments/attachment1/download');

      expect(response.status).toBe(401);
      expect(response.body.msg).toBe('Token not pass');

      expect(mockCallFunction).not.toHaveBeenCalled();
    });

    it('should return 500 when presigned URL generation fails', async () => {
      mockCallFunction.mockResolvedValueOnce(mockAttachment); // getAttachment
      mockGeneratePresignedUrl.mockRejectedValueOnce(new Error('S3 error'));

      const response = await request(app)
        .get('/attachments/attachment1/download')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error download attachment');

      expect(mockGeneratePresignedUrl).toHaveBeenCalledWith(mockAttachment.url);
    });

    it('should return 500 when database error occurs', async () => {
      mockCallFunction.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .get('/attachments/attachment1/download')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error download attachment');

      expect(mockCallFunction).toHaveBeenCalledWith('getAttachment', {attachmentId: 'attachment1'}, 'fake-token');
    });
  });
});
