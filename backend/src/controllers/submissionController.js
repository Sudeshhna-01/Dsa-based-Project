import { Submission } from '../models/submission.js';
import { body, validationResult } from 'express-validator';

export const validateSubmission = [
  body('problem_name').notEmpty().trim().withMessage('Problem name is required'),
  body('difficulty').isIn(['Easy', 'Medium', 'Hard']).withMessage('Difficulty must be Easy, Medium, or Hard'),
  body('topic').notEmpty().trim().withMessage('Topic is required'),
  body('time_taken').isInt({ min: 0 }).withMessage('Time taken must be a positive integer')
];

export const createSubmission = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors.array()
      });
    }

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
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const difficulty = req.query.difficulty;
    const topic = req.query.topic;
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder || 'DESC';

    const result = await Submission.findByUserId(req.userId, { 
      page, 
      limit, 
      difficulty, 
      topic,
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors.array()
      });
    }

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

    if (!Array.isArray(submissions) || submissions.length === 0) {
      return res.status(422).json({
        code: 'INVALID_INPUT',
        message: 'Submissions must be a non-empty array',
        details: {}
      });
    }

    const created = [];
    for (const sub of submissions) {
      try {
        const submission = await Submission.create(req.userId, sub);
        created.push(submission);
      } catch (error) {
        continue;
      }
    }

    res.status(201).json({
      code: 'SUCCESS',
      message: `${created.length} submission(s) created successfully`,
      data: created
    });
  } catch (error) {
    next(error);
  }
};

