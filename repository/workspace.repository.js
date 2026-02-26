import MemberWorkspace from "../models/MemberWorkspace.model.js";
import Workspace from "../models/Workspace.model.js";

class WorkspaceRepository {

    // Obtener workspace por id
    async getById(workspace_id) {
        return await Workspace.findById(workspace_id);
    }

    // Obtener todos los workspaces de un usuario
    async getWorkspacesByUserId(user_id) {
        const memberships = await MemberWorkspace.find({ fk_id_user: user_id })
            .populate({
                path: 'fk_id_workspace',
                match: { active: true } // Solo workspaces activos
            });

        return memberships
            .filter(m => m.fk_id_workspace !== null)
            .map(m => m.fk_id_workspace); // Devolver solo el workspace
    }

    // Crear un workspace nuevo
    async create(fk_id_owner, title, image, description) {
        const workspace = await Workspace.create({
            fk_id_owner,
            title,
            image,
            description,
            active: true
        });
        return workspace;
    }

    // Agregar un miembro a un workspace
    async addMember(workspace_id, user_id, role) {
        // Evitar duplicados
        const existing = await MemberWorkspace.findOne({ fk_id_workspace: workspace_id, fk_id_user: user_id });
        if (existing) return existing;

        const member = await MemberWorkspace.create({
            fk_id_workspace: workspace_id,
            fk_id_user: user_id,
            role
        });
        return member;
    }

    // Obtener un miembro por workspace_id y user_id
    async getMemberByWorkspaceIdAndUserId(workspace_id, user_id) {
        return await MemberWorkspace.findOne({ fk_id_workspace: workspace_id, fk_id_user: user_id });
    }

    // Eliminar (desactivar) workspace
    async delete(workspace_id) {
        await Workspace.findByIdAndUpdate(workspace_id, { active: false });
    }

    // Obtener todos los miembros de un workspace
    async getMembersByWorkspaceId(workspace_id) {
        return await MemberWorkspace.find({ fk_id_workspace: workspace_id })
            .populate('fk_id_user', 'username email');
    }

    // Actualizar rol de un miembro
    async updateMember(member_id, role) {
        const member = await MemberWorkspace.findByIdAndUpdate(member_id, { role }, { new: true });
        return member;
    }

    // Eliminar un miembro del workspace
    async removeMember(member_id) {
        return await MemberWorkspace.findByIdAndDelete(member_id);
    }

    // Actualizar workspace
    async update(workspace_id, fields) {
        const workspace = await Workspace.findByIdAndUpdate(workspace_id, fields, { new: true });
        return workspace;
    }

}

const workspaceRepository = new WorkspaceRepository();
export default workspaceRepository;