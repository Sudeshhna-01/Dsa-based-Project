import express from 'express';
import { 
  createSubmission, 
  getSubmissions, 
  getAllSubmissions,
  getSubmissionById, 
  updateSubmission, 
  deleteSubmission,
  bulkCreateSubmissions,
  validateSubmission,
  validateBulkSubmissions,
  handleValidationErrors
} from '../controllers/submissionController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.post('/', validateSubmission, handleValidationErrors, createSubmission);
router.post('/bulk', validateBulkSubmissions, handleValidationErrors, bulkCreateSubmissions);
router.get('/all', getAllSubmissions); // For export
router.get('/', getSubmissions);
router.get('/:id', getSubmissionById);
router.put('/:id', validateSubmission, handleValidationErrors, updateSubmission);
router.delete('/:id', deleteSubmission);

export default router;

