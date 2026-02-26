import messagesRepository from "../repository/messages.repository.js"

class MessagesController {
    async create(request, response) {
        try {
            const { content } = request.body
            const member_id = request.member._id
            const { channel_id } = request.params
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

    async getByChannelId(request, response) {
        try {
            const { channel_id } = request.params
            const messages = await messagesRepository.getAllByChannelId(channel_id)
            return response.json(
                {
                    status: 200,
                    ok: true,
                    data: {
                        messages
                    },
                    message: 'Mensajes obtenidos con exito'
                }
            )
        }
        catch (error) {
            console.log("Error en obtener mensajes", error)
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

    async deleteMessage(request, response) {
        try {
            const { message_id } = request.params
            const member = request.member

            const message = await messagesRepository.getById(message_id)
            if (!message) {
                return response.json({ ok: false, status: 404, message: 'Mensaje no encontrado', data: null })
            }

            // check authorization
            // member._id is the MemberWorkspace ID if we look at workspaceMiddleware
            // Wait, member is member_selected from workspaceMiddleware, so member._id is the MemberWorkspace document id
            if (member.role !== 'Admin' && member.role !== 'Owner') {
                if (message.fk_workspace_member_id.toString() !== member._id.toString()) {
                    return response.json({ ok: false, status: 403, message: 'No tienes permisos para eliminar este mensaje', data: null })
                }
            }

            await messagesRepository.delete(message_id)

            return response.json({
                status: 200,
                ok: true,
                message: 'Mensaje eliminado con exito',
                data: null
            })

        } catch (error) {
            console.log("Error en deleteMessage", error)
            if (error.status) {
                return response.json({ status: error.status, ok: false, message: error.message, data: null })
            }
            return response.json({ ok: false, status: 500, message: "Error interno del servidor", data: null })
        }
    }
}

const messagesController = new MessagesController()
export default messagesController