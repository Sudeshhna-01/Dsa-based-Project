import express from 'express';
import { 
  createSubmission, 
  getSubmissions, 
  getAllSubmissions,
  getSubmissionById, 
  updateSubmission, 
  deleteSubmission,
  bulkCreateSubmissions,
  validateSubmission 
} from '../controllers/submissionController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.post('/', validateSubmission, createSubmission);
router.post('/bulk', bulkCreateSubmissions);
router.get('/all', getAllSubmissions); // For export
router.get('/', getSubmissions);
router.get('/:id', getSubmissionById);
router.put('/:id', validateSubmission, updateSubmission);
router.delete('/:id', deleteSubmission);

export default router;

