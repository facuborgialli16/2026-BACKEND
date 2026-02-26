import ENVIRONMENT from "../config/environment.config.js"
import userRepository from "../repository/user.repository.js"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import mail_transporter from "../config/mail.config.js"
import ServerError from "../helpers/error.helpers.js"

class AuthController {
    async register(request, response) {
        const { email, password, username } = request.body

        if (!email || !password || !username) {
            throw new ServerError('Debes enviar todos los datos', 400)
        }

        const user = await userRepository.buscarUnoPorEmail(email)
        if (user) {
            throw new ServerError('El email ya esta registrado', 400)
        }
        let hashed_password = await bcrypt.hash(password, 10)
        await userRepository.crear(email, hashed_password, username)

        const verification_email_token = jwt.sign(
            {
                email: email //Guardamos el email del usuario que se quiere registrar
            },
            ENVIRONMENT.JWT_SECRET_KEY
        )

        mail_transporter.sendMail(
            {
                from: ENVIRONMENT.GMAIL_USERNAME,
                to: email,
                subject: 'Verifica tu email',
                html: `
                <h1>Bienvenido ${username}</h1>
                <p>Necesitamos que verifiques tu mail</p>
                <p>Haz click en "Verificar" para verificar este mail</p>
                <a 
                href='http://localhost:8080/api/auth/verify-email?verification_email_token=${verification_email_token}'
                >Verificar</a>
                <br>
                <span>Si desconoces este registro desestima este mail</span>
                `
            }
        )

        return response.json({
            message: 'Usuario creado exitosamente',
            status: 201,
            ok: true,
            data: null
        })
    }

    async login(request, response) {
        const { email, password } = request.body
        /* 
        Aplicar validaciones sobre el email y la password
        */
        if (!email) {
            throw new ServerError('Debes enviar un email', 400)
        }
        else if (!(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email))) {
            throw new ServerError('El email no es valido', 400)
        }

        const usuario_encontrado = await userRepository.buscarUnoPorEmail(email)

        if (!usuario_encontrado) {
            throw new ServerError('Credenciales invalidas', 401)
        }

        if (!(await bcrypt.compare(password, usuario_encontrado.password))) {
            /* Respondemos igual a que si no existiese para mayor seguridad */
            throw new ServerError('Credenciales invalidas', 401)
        }

        if (!usuario_encontrado.email_verified) {
            throw new ServerError('Usuario con email no verificado', 401)
        }

        const datos_del_token = {
            username: usuario_encontrado.username,
            email: usuario_encontrado.email,
            id: usuario_encontrado.id
        }


        const auth_token = jwt.sign(datos_del_token, ENVIRONMENT.JWT_SECRET_KEY)
        return response.json({
            message: 'Inicio de sesion exitoso',
            ok: true,
            status: 200,
            data: {
                auth_token: auth_token
            }
        })

    }

    async verifyEmail(request, response) {
        const { verification_email_token } = request.query

        if (!verification_email_token) {
            throw new ServerError('No se envio el token de verificacion', 400)
        }

        try {
            const { email } = jwt.verify(
                verification_email_token,
                ENVIRONMENT.JWT_SECRET_KEY
            )
            const user_found = await userRepository.buscarUnoPorEmail(email)

            if (!user_found) {
                throw new ServerError('No existe usuario con ese mail', 404)
            }

            if (user_found.email_verified) {
                throw new ServerError('Usuario ya verificado', 400)
            }

            await userRepository.actualizarPorId(
                user_found._id,
                {
                    email_verified: true
                }
            )

            return response.redirect(
                ENVIRONMENT.URL_FRONTEND + '/login?from=email-validated'
            )
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new ServerError('No autorizado', 401)
            }
            throw error
        }
    }

    async forgotPassword(request, response) {
        try {
            const { email } = request.body
            if (!email) {
                throw new ServerError('El email es requerido', 400)
            }
            const user_found = await userRepository.buscarUnoPorEmail(email)
            if (!user_found) {
                // Return success anyway, to prevent email enumeration
                return response.json({ ok: true, status: 200, message: 'Si el correo existe, se ha enviado un enlace de recuperacion', data: null })
            }

            const reset_token = jwt.sign(
                { email: user_found.email },
                ENVIRONMENT.JWT_SECRET_KEY,
                { expiresIn: '1h' }
            )

            const reset_url = `${ENVIRONMENT.URL_FRONTEND}/reset-password?token=${reset_token}`

            await mail_transporter.sendMail({
                from: ENVIRONMENT.GMAIL_USERNAME,
                to: email,
                subject: 'Recuperacion de contrasena',
                html: `
                    <h1>Recuperacion de contrasena</h1>
                    <p>Has solicitado restablecer tu contrasena.</p>
                    <p>Haz clic en el enlace de abajo para restablecerla. El enlace expirara en 1 hora.</p>
                    <a href='${reset_url}'>Restablecer contrasena</a>
                    <br>
                    <span>Si no solicitaste esto, ignora este correo.</span>
                `
            })

            return response.json({
                ok: true,
                status: 200,
                message: 'Si el correo existe, se ha enviado un enlace de recuperacion',
                data: null
            })
        } catch (error) {
            console.log("Error en forgotPassword", error)
            if (error.status) {
                return response.json({ status: error.status, ok: false, message: error.message, data: null })
            }
            return response.json({ ok: false, status: 500, message: "Error interno del servidor", data: null })
        }
    }

    async resetPassword(request, response) {
        try {
            const { reset_token, password } = request.body

            if (!reset_token || !password) {
                throw new ServerError('El token y la contrasena son requeridos', 400)
            }

            const decoded = jwt.verify(reset_token, ENVIRONMENT.JWT_SECRET_KEY)
            const email = decoded.email

            const user_found = await userRepository.buscarUnoPorEmail(email)
            if (!user_found) {
                throw new ServerError('Usuario no encontrado', 404)
            }

            const hashed_password = await bcrypt.hash(password, 10)
            await userRepository.actualizarPorId(user_found._id, { password: hashed_password })

            return response.json({
                ok: true,
                status: 200,
                message: 'Contrasena restablecida con exito',
                data: null
            })
        } catch (error) {
            console.log("Error en resetPassword", error)
            if (error instanceof jwt.JsonWebTokenError) {
                return response.json({ ok: false, status: 400, message: 'Token invalido o expirado', data: null })
            }
            if (error.status) {
                return response.json({ status: error.status, ok: false, message: error.message, data: null })
            }
            return response.json({ ok: false, status: 500, message: "Error interno del servidor", data: null })
        }
    }
}

const authController = new AuthController()

export default authController



/* 
condicion sobre una variable
un bucle de 100 a 1000 registros (donde no se consulta a ningun servicio externo)
una consulta a DB (Debatible porque si la DB tiene millones de registros puede ser mas costoso)
una consulta a otro servidor
*/