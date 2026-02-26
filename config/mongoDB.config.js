import mongoose from "mongoose"
import ENVIRONMENT from "./environment.config.js"
/* CONEXION CON MONGODB */

const connection_string = `${ENVIRONMENT.MONGO_DB_URI}/${ENVIRONMENT.MONGO_DB_NAME}`

export async function connectMongoDB() {
    if (!ENVIRONMENT.MONGO_DB_URI || !ENVIRONMENT.MONGO_DB_NAME) {
        console.error('CRITICAL: MONGO_DB_URI or MONGO_DB_NAME is undefined. Check Vercel Environment Variables.')
        return
    }

    // Mask password for safe logging
    const masked_uri = connection_string.replace(/:([^:@]{1,})@/, ':****@')
    console.log('Intentando conectar a:', masked_uri)

    try {
        await mongoose.connect(connection_string, {
            serverSelectionTimeoutMS: 10000,
        })
        console.log('Conexión a MongoDB exitosa')
    }
    catch (error) {
        console.error('Error de conexión con MongoDB:', error.message)
        if (error.message.includes('buffering timed out')) {
            console.error('TIP: Verifica que las variables de entorno en Vercel NO tengan comillas ni espacios.')
        }
    }
}