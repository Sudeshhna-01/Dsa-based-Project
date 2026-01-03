import { body, validationResult } from 'express-validator';

// Sanitize string inputs to prevent XSS
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 500); // Limit length
};

// Validate and sanitize submission data
export const validateAndSanitizeSubmission = [
  body('problem_name')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Problem name is required and must be less than 255 characters')
    .customSanitizer(sanitizeString),
  body('difficulty')
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty must be Easy, Medium, or Hard'),
  body('topic')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Topic is required and must be less than 100 characters')
    .customSanitizer(sanitizeString),
  body('time_taken')
    .isInt({ min: 0, max: 10000 })
    .withMessage('Time taken must be a positive integer between 0 and 10000 minutes')
];

// Validate bulk submissions
export const validateBulkSubmissions = [
  body('submissions')
    .isArray({ min: 1, max: 100 })
    .withMessage('Submissions must be an array with 1-100 items'),
  body('submissions.*.problem_name')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 255 }),
  body('submissions.*.difficulty')
    .isIn(['Easy', 'Medium', 'Hard']),
  body('submissions.*.topic')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 100 }),
  body('submissions.*.time_taken')
    .isInt({ min: 0, max: 10000 })
];

// Validation result handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

