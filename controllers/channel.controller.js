import { channelRepository } from "../repository/channel.repository.js"
import ServerError from "../helpers/error.helpers.js"

class ChannelController {
    async getAllByWorkspaceId(request, response) {
        try {
            const { workspace_id } = request.params
            const channels = await channelRepository.getAllByWorkspaceId(workspace_id)
            response.json(
                {
                    status: 200,
                    ok: true,
                    message: 'Canales obtenidos con exito',
                    data: {
                        channels
                    }
                }
            )
        }
        catch (error) {
            console.log("Error en addMember", error)
            /* Si tiene status decimos que es un error controlado (osea es esperable) */
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

    async create(request, response) {
        try {
            const { name } = request.body
            const { workspace_id } = request.params

            //Pueden validar el nombre

            const channel_created = await channelRepository.create(workspace_id, name)
            response.json(
                {
                    status: 201,
                    ok: true,
                    message: 'Canal creado con exito',
                    data: {
                        channel_created
                    }
                }
            )
        }
        catch (error) {
            console.log("Error en addMember", error)
            /* Si tiene status decimos que es un error controlado (osea es esperable) */
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

    async update(request, response) {
        try {
            const { channel_id, workspace_id } = request.params
            const { name } = request.body

            if (!name) {
                throw new ServerError("El nombre es requerido", 400)
            }

            // Validar que el canal pertenezca al workspace de la URL
            const channel = await channelRepository.getByIdAndWorkspaceId(channel_id, workspace_id)
            if (!channel) {
                throw new ServerError('El canal no existe o no pertenece a este espacio de trabajo', 404)
            }

            const channel_updated = await channelRepository.update(channel_id, { name })
            response.json({
                status: 200,
                ok: true,
                message: 'Canal actualizado con exito',
                data: {
                    channel: channel_updated
                }
            })
        } catch (error) {
            console.log("Error en update channel", error)
            if (error.status) {
                return response.json({ status: error.status, ok: false, message: error.message, data: null })
            }
            return response.json({ ok: false, status: 500, message: "Error interno del servidor", data: null })
        }
    }

    async delete(request, response) {
        try {
            const { channel_id, workspace_id } = request.params

            // Validar que el canal pertenezca al workspace de la URL
            const channel = await channelRepository.getByIdAndWorkspaceId(channel_id, workspace_id)
            if (!channel) {
                throw new ServerError('El canal no existe o no pertenece a este espacio de trabajo', 404)
            }

            await channelRepository.delete(channel_id)
            response.json({
                status: 200,
                ok: true,
                message: 'Canal eliminado con exito',
                data: null
            })
        } catch (error) {
            console.log("Error en delete channel", error)
            if (error.status) {
                return response.json({ status: error.status, ok: false, message: error.message, data: null })
            }
            return response.json({ ok: false, status: 500, message: "Error interno del servidor", data: null })
        }
    }
}

const channelController = new ChannelController()
export { channelController }