import { connectMongoDB } from "./config/mongoDB.config.js"
import express from 'express'
import authRouter from "./routes/auth.router.js"
import cors from 'cors'
import workspaceRouter, { invitationRouter } from "./routes/workspace.router.js"
import { verifyApiKeyMiddleware } from "./middlewares/apikey.middleware.js"
import { errorHandlerMiddleware } from "./middlewares/error.middleware.js"

connectMongoDB()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (request, response) => {
    response.json({
        ok: true,
        message: 'Servidor funcionando correctamente',
        data: null
    })
})
// ✅ RUTAS PUBLICAS (SIN API KEY)
app.use("/api/auth", authRouter)
app.use("/api/invitations", invitationRouter)

// 🔐 A PARTIR DE ACÁ TODO REQUIERE API KEY
app.use(verifyApiKeyMiddleware)

// 🔒 RUTAS PRIVADAS
app.use("/api/workspace", workspaceRouter)



// ⚠️ SIEMPRE AL FINAL
app.use(errorHandlerMiddleware)

app.listen(8080, () => {
    console.log('Nuestra app se escucha en el puerto 8080')
})