import messagesRepository from "../repository/messages.repository.js"

class MessagesController {
    async create (request, response){
        try{
            const {content} = request.body
            const member_id = request.member._id
            const {channel_id} = request.params
            await messagesRepository.create(member_id, content, channel_id)

            return response.json(
                {
                    ok: true, 
                    status: 201,
                    message: 'Mensaje creado con exito'
                }
            )
        }
        catch (error) {
            console.log("Error en crear mensaje", error)
            if (error.status) {
                return response.json({
                    status: error.status,
                    ok: false,
                    message: error.message,
                    data: null
                })
            }

            return response.json({
                ok: false,
                status: 500,
                message: "Error interno del servidor",
                data: null
            })
        }
    }

    async getByChannelId (request, response){
        try{

        }
         catch (error) {
            console.log("Error en crear mensaje", error)
            if (error.status) {
                return response.json({
                    status: error.status,
                    ok: false,
                    message: error.message,
                    data: null
                })
            }

            return response.json({
                ok: false,
                status: 500,
                message: "Error interno del servidor",
                data: null
            })
        }
    }
}

const messagesController = new MessagesController()
export default messagesController