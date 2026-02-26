import ENVIRONMENT from "../config/environment.config.js"
import mail_transporter from "../config/mail.config.js"
import ServerError from "../helpers/error.helpers.js"
import userRepository from "../repository/user.repository.js"
import workspaceRepository from "../repository/workspace.repository.js"
import MemberWorkspace from "../models/MemberWorkspace.model.js"

import jwt from 'jsonwebtoken'

class WorkspaceController {
    async getWorkspaces(request, response) {
        //Quiero obtener los espacios de trabajo asociados al cliente que hace la consulta
        console.log("El usuario logueado es: ", request.user) //request.user
        const user_id = request.user.id
        const workspaces = await workspaceRepository.getWorkspacesByUserId(user_id)
        response.json({
            ok: true,
            data: {
                workspaces
            }
        })
    }

    async create(request, response) {
        const { title, image, description } = request.body
        const user_id = request.user.id
        const workspace = await workspaceRepository.create(user_id, title, image, description)
        await workspaceRepository.addMember(workspace._id, user_id, 'Owner')
        response.json({
            ok: true,
            data: {
                workspace
            }
        })
    }


    async delete(request, response) {
        try {
            const user_id = request.user.id
            const { workspace_id } = request.params

            const workspace_selected = await workspaceRepository.getById(workspace_id)
            if (!workspace_selected) {
                throw new ServerError('No existe ese espacio de trabajo', 404)
            }
            const member_info = await workspaceRepository.getMemberByWorkspaceIdAndUserId(workspace_id, user_id)
            if (member_info.role !== 'Owner') {
                throw new ServerError('No tienes permiso para eliminar este espacio de trabajo', 403)
            }
            await workspaceRepository.delete(workspace_id)
            response.json({
                ok: true,
                message: 'Espacio de trabajo eliminado correctamente',
                data: null,
                status: 200
            })
        }
        catch (error) {
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

    async addMemberRequest(request, response) {
        try {
            const { email, role } = request.body
            const workspace = request.workspace

            console.log({ workspace })
            const user_to_invite = await userRepository.buscarUnoPorEmail(email)
            if (!user_to_invite) {
                throw new ServerError('El email del invitado no existe.', 404)
            }

            const already_member = await workspaceRepository.getMemberByWorkspaceIdAndUserId(workspace._id, user_to_invite._id)


            if (already_member) {
                throw new ServerError('El usuario ya es miembro de este espacio de trabajo', 400)
            }

            const token = jwt.sign(
                {
                    id: user_to_invite._id,
                    email,
                    workspace: workspace._id,
                    role
                },
                ENVIRONMENT.JWT_SECRET_KEY
            )

            await mail_transporter.sendMail(
                {
                    to: email,
                    from: ENVIRONMENT.GMAIL_USERNAME,
                    subject: `Has sido invitado a ${workspace.title}`,
                    html: `
                        <h1>Has sido invitado a participar en el espacio de trabajo: ${workspace.title}</h1>
                        <p>Si no reconoces esta invitacion por favor desestima este mail</p>
                        <p>Da click a 'aceptar invitacion' para aceptar la invitacion</p>
                        <a
                        href='${ENVIRONMENT.URL_BACKEND}/api/invitations/accept?invitation_token=${token}'
                        >Aceptar invitacion</a>
                    `
                }
            )

            return response.json(
                {
                    status: 201,
                    ok: true,
                    message: "invitacion enviada",
                    data: null
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

    async acceptInvitation(request, response) {
        try {
            const { invitation_token } = request.query

            const payload = jwt.verify(invitation_token, ENVIRONMENT.JWT_SECRET_KEY)
            const { id, workspace: workspace_id, role } = payload
            await workspaceRepository.addMember(workspace_id, id, role)

            response.redirect(`${ENVIRONMENT.URL_FRONTEND}/`)
        }
        catch (error) {
            console.error("Error en acceptInvitation:", error)

            if (error instanceof jwt.JsonWebTokenError) {
                return response.json({
                    ok: false,
                    status: 400,
                    message: "El token de invitacion es invalido o ha expirado.",
                    data: null
                })
            }

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

    async getById(request, response) {
        try {
            const { workspace, member } = request
            response.json({
                ok: true,
                status: 200,
                data: {
                    workspace,
                    member
                },
                message: 'Espacio de trabajo seleccionado'
            })
        }
        catch (error) {
            console.log({ error })
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
            const { workspace_id } = request.params
            const updated_fields = request.body

            // You might want to filter allowed fields to update. e.g. title, image, description
            const { title, image, description } = updated_fields
            const fields_to_update = {}
            if (title) fields_to_update.title = title
            if (image) fields_to_update.image = image
            if (description) fields_to_update.description = description

            const workspace = await workspaceRepository.update(workspace_id, fields_to_update)

            response.json({
                ok: true,
                status: 200,
                data: {
                    workspace
                },
                message: 'Espacio de trabajo actualizado con exito'
            })
        }
        catch (error) {
            console.log("Error en update workspace", error)
            if (error.status) {
                return response.json({ status: error.status, ok: false, message: error.message, data: null })
            }
            return response.json({ ok: false, status: 500, message: "Error interno del servidor", data: null })
        }
    }

    async removeMember(request, response) {
        try {
            const { workspace_id, member_id } = request.params
            const { member: requester } = request // El que hace la operacion (gracias al middleware)

            // Buscar el miembro a remover
            const member_to_remove = await MemberWorkspace.findById(member_id)
            if (!member_to_remove) {
                throw new ServerError('No se encontro el miembro', 404)
            }

            // Validar que el miembro pertenezca al workspace de la URL
            if (member_to_remove.fk_id_workspace.toString() !== workspace_id) {
                throw new ServerError('El miembro no pertenece a este espacio de trabajo', 400)
            }

            // Jerarquia: El Admin no puede expulsar al Owner
            if (requester.role === 'Admin' && member_to_remove.role === 'Owner') {
                throw new ServerError('No tienes permiso para expulsar al Owner', 403)
            }

            // Opcional: El Admin no puede expulsar a otro Admin? (Segun el usuario "el admin tambien" puede expulsar gente, pero no al owner)
            // Si el cliente no especifico sobre Admin vs Admin, permitiremos que el Admin expulse a otros Administradores si es necesario,
            // pero lo mas seguro es que el Admin solo pueda expulsar Members y Administradores (pero NUNCA al Owner).

            await workspaceRepository.removeMember(member_id)

            response.json({
                ok: true,
                status: 200,
                message: 'Miembro eliminado con exito',
                data: null
            })
        } catch (error) {
            console.log("Error en removeMember", error)
            if (error.status) {
                return response.json({ status: error.status, ok: false, message: error.message, data: null })
            }
            return response.json({ ok: false, status: 500, message: "Error interno del servidor", data: null })
        }
    }

    async updateMember(request, response) {
        try {
            const { workspace_id, member_id } = request.params
            const { role } = request.body
            const { member: requester } = request

            if (!['Admin', 'Member', 'Owner'].includes(role)) {
                throw new ServerError('Rol invalido', 400)
            }

            // Buscar el miembro a actualizar
            const member_to_update = await MemberWorkspace.findById(member_id)
            if (!member_to_update) {
                throw new ServerError('No se encontro el miembro', 404)
            }

            // Validar que el miembro pertenezca al workspace de la URL
            if (member_to_update.fk_id_workspace.toString() !== workspace_id) {
                throw new ServerError('El miembro no pertenece a este espacio de trabajo', 400)
            }

            // Jerarquia: El Admin no puede cambiar el rol del Owner
            if (requester.role === 'Admin' && member_to_update.role === 'Owner') {
                throw new ServerError('No tienes permiso para cambiar el rol del Owner', 403)
            }

            // Jerarquia: El Admin no puede promover a nadie a Owner
            if (requester.role === 'Admin' && role === 'Owner') {
                throw new ServerError('Solo el Owner puede asignar nuevos Owners', 403)
            }

            const member_updated = await workspaceRepository.updateMember(member_id, role)

            response.json({
                ok: true,
                status: 200,
                message: 'Miembro actualizado con exito',
                data: {
                    member: member_updated
                }
            })
        } catch (error) {
            console.log("Error en updateMember", error)
            if (error.status) {
                return response.json({ status: error.status, ok: false, message: error.message, data: null })
            }
            return response.json({ ok: false, status: 500, message: "Error interno del servidor", data: null })
        }
    }

    async getMembers(request, response) {
        try {
            const { workspace_id } = request.params
            const members = await workspaceRepository.getMembersByWorkspaceId(workspace_id)
            response.json({
                ok: true,
                status: 200,
                data: { members }
            })
        } catch (error) {
            console.log("Error en getMembers", error)
            if (error.status) {
                return response.json({ status: error.status, ok: false, message: error.message, data: null })
            }
            return response.json({ ok: false, status: 500, message: "Error interno del servidor", data: null })
        }
    }

}

const workspaceController = new WorkspaceController()
export default workspaceController