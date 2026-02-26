import express from 'express'
import authController from '../controllers/auth.controller.js'

const authRouter = express.Router()


authRouter.post(
    '/register',
    authController.register
)

authRouter.post(
    '/login',
    authController.login
)

authRouter.get(
    '/verify-email',
    authController.verifyEmail
)

authRouter.post(
    '/forgot-password',
    authController.forgotPassword
)

authRouter.put(
    '/reset-password',
    authController.resetPassword
)

export default authRouter