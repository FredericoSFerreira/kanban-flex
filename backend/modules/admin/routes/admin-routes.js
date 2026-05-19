import express from 'express';
import { verifyAdmin } from '../../../middleware/auth.js';
import {
  getAllUsers,
  getAllBoards,
  toggleUserActive,
  toggleUserAdmin,
  getDashboardUsersStats,
  getDashboardBoardsStats,
  getDashboardGrowth,
  getDashboardTopBoards,
  getDashboardActivityHeatmap,
  getDashboardEngagement,
  getDashboardColumnDistribution,
  getDashboardAttachmentsGrowth,
  getDashboardVisibilityTrend,
  getDashboardLoginMethods,
  getDashboardInviteFunnel,
  getDashboardMostEngagedBoards,
} from '../controllers/admin-controller.js';

const adminRouter = express.Router();

adminRouter.get('/admin/users', verifyAdmin, getAllUsers);
adminRouter.get('/admin/boards', verifyAdmin, getAllBoards);
adminRouter.patch('/admin/users/:id/toggle', verifyAdmin, toggleUserActive);
adminRouter.patch('/admin/users/:id/admin', verifyAdmin, toggleUserAdmin);

adminRouter.get('/admin/dashboard/users-stats', verifyAdmin, getDashboardUsersStats);
adminRouter.get('/admin/dashboard/boards-stats', verifyAdmin, getDashboardBoardsStats);
adminRouter.get('/admin/dashboard/growth', verifyAdmin, getDashboardGrowth);
adminRouter.get('/admin/dashboard/top-boards', verifyAdmin, getDashboardTopBoards);
adminRouter.get('/admin/dashboard/activity-heatmap', verifyAdmin, getDashboardActivityHeatmap);
adminRouter.get('/admin/dashboard/engagement', verifyAdmin, getDashboardEngagement);
adminRouter.get('/admin/dashboard/column-distribution', verifyAdmin, getDashboardColumnDistribution);
adminRouter.get('/admin/dashboard/attachments-growth', verifyAdmin, getDashboardAttachmentsGrowth);
adminRouter.get('/admin/dashboard/visibility-trend', verifyAdmin, getDashboardVisibilityTrend);
adminRouter.get('/admin/dashboard/login-methods', verifyAdmin, getDashboardLoginMethods);
adminRouter.get('/admin/dashboard/invite-funnel', verifyAdmin, getDashboardInviteFunnel);
adminRouter.get('/admin/dashboard/most-engaged-boards', verifyAdmin, getDashboardMostEngagedBoards);

export default adminRouter;
