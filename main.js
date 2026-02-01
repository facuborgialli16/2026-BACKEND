
import { connectMongoDB } from "./config/mongoDB.config.js"
import express from 'express'
import authRouter from "./routes/auth.router.js"
import cors from 'cors'
import workspaceRouter from "./routes/workspace.router.js"
import workspaceRepository from "./repository/workspace.repository.js"
import messagesRepository from "./repository/messages.repository.js"

connectMongoDB()

//Crear un servidor web (Express app)
const app = express()

/* 
Esto permite que otras direcciones distintas a la nuesta puedan consultar nuestro servidor
*/
app.use(cors())

//Habilita a mi servidor a recibir json por body
/* 
lee el request.headers.['content-type'] y si el valor es 'application/json' entonces guarda en request.body el json transformado
*/
app.use(express.json())



app.use("/api/auth", authRouter)
app.use("/api/workspace", workspaceRouter)

app.listen(
    8080, 
    () => {
        console.log('Nuestra app se escucha en el puerto 8080')
    }
)

/* mail_transporter.sendMail({
    from: ENVIRONMENT.GMAIL_USERNAME,
    to: ENVIRONMENT.GMAIL_USERNAME,
    subject: 'Probando nodemailer',
    html: `<h1>Probando nodemailer</h1>`
}) */

/* 
//Quiero crear un espacio de trabajo de prueba
*/

/* async function crearEspacioDeTrabajo (){

    //Creo el espacio de trabajo de prueba
    const workspace = await workspaceRepository.create(
        '69664b767fa3b6ffd51dcd7b', //Remplazen por su id
        'test',
        'https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        'Descripcion del espacio de trabajo'
    )
    //Me agrego como miembro
    await workspaceRepository.addMember(workspace._id, '69664b767fa3b6ffd51dcd7b' //Remplazen por su id, 'Owner')
}

crearEspacioDeTrabajo() */

/* 
1ero:
    Crear espacio de trabajo
    Agregar miembro

2do: Crear endpoint para obtener espacios de trabajo asociados al usuario
3ro: Probar con postman
*/

messagesRepository.getAllByChannelId('697a9e0810a7bd95ee51189d').then(result => console.log(JSON.stringify(result)))