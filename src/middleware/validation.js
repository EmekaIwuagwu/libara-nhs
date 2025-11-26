const { body, validationResult } = require('express-validator');

// Validation rules
const validationRules = {
  register: [
    body('first_name')
      .trim()
      .notEmpty().withMessage('First name is required')
      .isLength({ min: 2, max: 100 }).withMessage('First name must be between 2 and 100 characters'),
    body('last_name')
      .trim()
      .notEmpty().withMessage('Last name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Last name must be between 2 and 100 characters'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email address')
      .normalizeEmail(),
    body('username')
      .trim()
      .notEmpty().withMessage('Username is required')
      .isLength({ min: 3, max: 100 }).withMessage('Username must be between 3 and 100 characters')
      .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('confirm_password')
      .notEmpty().withMessage('Please confirm your password')
      .custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match'),
    body('phone')
      .optional({ checkFalsy: true })
      .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/).withMessage('Invalid phone number'),
  ],

  login: [
    body('username')
      .trim()
      .notEmpty().withMessage('Username or email is required'),
    body('password')
      .notEmpty().withMessage('Password is required'),
  ],

  applicationConfig: [
    body('config_name')
      .trim()
      .notEmpty().withMessage('Configuration name is required')
      .isLength({ max: 255 }).withMessage('Configuration name is too long'),
    body('job_title')
      .trim()
      .notEmpty().withMessage('Job title is required')
      .isLength({ max: 255 }).withMessage('Job title is too long'),
    body('job_location')
      .trim()
      .notEmpty().withMessage('Job location is required')
      .isLength({ max: 255 }).withMessage('Job location is too long'),
    body('skills')
      .trim()
      .notEmpty().withMessage('Skills are required'),
    body('min_salary')
      .optional({ checkFalsy: true })
      .isFloat({ min: 0 }).withMessage('Minimum salary must be a positive number'),
    body('max_salary')
      .optional({ checkFalsy: true })
      .isFloat({ min: 0 }).withMessage('Maximum salary must be a positive number')
      .custom((value, { req }) => {
        if (req.body.min_salary && value && parseFloat(value) < parseFloat(req.body.min_salary)) {
          throw new Error('Maximum salary must be greater than minimum salary');
        }
        return true;
      }),
    body('profile_summary')
      .optional({ checkFalsy: true })
      .trim(),
  ],

  updateProfile: [
    body('first_name')
      .trim()
      .notEmpty().withMessage('First name is required')
      .isLength({ min: 2, max: 100 }).withMessage('First name must be between 2 and 100 characters'),
    body('last_name')
      .trim()
      .notEmpty().withMessage('Last name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Last name must be between 2 and 100 characters'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email address')
      .normalizeEmail(),
    body('phone')
      .optional({ checkFalsy: true })
      .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/).withMessage('Invalid phone number'),
  ],

  changePassword: [
    body('current_password')
      .notEmpty().withMessage('Current password is required'),
    body('new_password')
      .notEmpty().withMessage('New password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('confirm_password')
      .notEmpty().withMessage('Please confirm your new password')
      .custom((value, { req }) => value === req.body.new_password).withMessage('Passwords do not match'),
  ],

  nhsCredentials: [
    body('portal')
      .notEmpty().withMessage('Portal is required')
      .isIn(['scotland', 'england']).withMessage('Invalid portal'),
    body('username')
      .trim()
      .notEmpty().withMessage('NHS username is required'),
    body('password')
      .notEmpty().withMessage('NHS password is required'),
  ],

  contact: [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email address')
      .normalizeEmail(),
    body('subject')
      .trim()
      .notEmpty().withMessage('Subject is required'),
    body('message')
      .trim()
      .notEmpty().withMessage('Message is required')
      .isLength({ min: 10 }).withMessage('Message must be at least 10 characters long'),
  ]
};

// Validation middleware
const validate = (validationType) => {
  return async (req, res, next) => {
    const rules = validationRules[validationType];
    if (!rules) {
      return next();
    }

    // Run all validations
    await Promise.all(rules.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // If AJAX request, return JSON
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Otherwise, redirect back with errors
    req.session.errors = errors.array();
    req.session.oldInput = req.body;
    return res.redirect('back');
  };
};

module.exports = {
  validate,
  validationRules
};
