import express from 'express';
import { verifyAdmin } from '../../../middleware/auth.js';
import { getAllUsers, getAllBoards, toggleUserActive } from '../controllers/admin-controller.js';

const adminRouter = express.Router();

adminRouter.get('/admin/users', verifyAdmin, getAllUsers);
adminRouter.get('/admin/boards', verifyAdmin, getAllBoards);
adminRouter.patch('/admin/users/:id/toggle', verifyAdmin, toggleUserActive);

export default adminRouter;
