import express from 'express';
import { register, login, validateRegister, validateLogin } from '../controllers/authController.js';
import { handleValidationErrors } from '../middleware/validator.js';

const router = express.Router();

router.post('/register', validateRegister, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);

export default router;

