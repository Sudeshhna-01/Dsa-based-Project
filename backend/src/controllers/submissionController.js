import { Submission } from '../models/submission.js';
import { validateAndSanitizeSubmission, validateBulkSubmissions, handleValidationErrors } from '../middleware/validator.js';

export { validateAndSanitizeSubmission as validateSubmission, validateBulkSubmissions, handleValidationErrors };

export const createSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.create(req.userId, req.body);
    res.status(201).json({
      code: 'SUCCESS',
      message: 'Submission created successfully',
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

export const getSubmissions = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 10), 100);
    const difficulty = req.query.difficulty;
    const topic = req.query.topic;
    const search = req.query.search?.trim().substring(0, 100); // Search by problem name
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const result = await Submission.findByUserId(req.userId, { 
      page, 
      limit, 
      difficulty, 
      topic,
      search,
      sortBy,
      sortOrder
    });
    
    res.json({
      code: 'SUCCESS',
      message: 'Submissions retrieved successfully',
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.findAllByUserId(req.userId);
    
    res.json({
      code: 'SUCCESS',
      message: 'All submissions retrieved successfully',
      data: submissions
    });
  } catch (error) {
    next(error);
  }
};

export const getSubmissionById = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Submission not found',
        details: {}
      });
    }

    if (submission.user_id !== req.userId) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Access denied',
        details: {}
      });
    }

    res.json({
      code: 'SUCCESS',
      message: 'Submission retrieved successfully',
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Submission not found',
        details: {}
      });
    }

    if (submission.user_id !== req.userId) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Access denied',
        details: {}
      });
    }

    const updated = await Submission.update(req.params.id, req.userId, req.body);
    res.json({
      code: 'SUCCESS',
      message: 'Submission updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Submission not found',
        details: {}
      });
    }

    if (submission.user_id !== req.userId) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Access denied',
        details: {}
      });
    }

    await Submission.delete(req.params.id, req.userId);
    res.json({
      code: 'SUCCESS',
      message: 'Submission deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

export const bulkCreateSubmissions = async (req, res, next) => {
  try {
    const { submissions } = req.body;
    const errors = [];
    const created = [];

    for (let i = 0; i < submissions.length; i++) {
      try {
        const submission = await Submission.create(req.userId, submissions[i]);
        created.push(submission);
      } catch (error) {
        errors.push({
          index: i,
          error: error.message || 'Validation failed',
          data: submissions[i]
        });
      }
    }

    if (created.length === 0) {
      return res.status(422).json({
        code: 'BULK_CREATE_FAILED',
        message: 'No submissions were created',
        details: { errors, total: submissions.length }
      });
    }

    res.status(201).json({
      code: 'SUCCESS',
      message: `${created.length} of ${submissions.length} submission(s) created successfully`,
      data: created,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    next(error);
  }
};

