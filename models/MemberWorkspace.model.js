import mongoose from "mongoose";

const WorkspaceMemberSchema = new mongoose.Schema(
    {
        fk_id_user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User' ,
            require: true
        },
        fk_id_workspace:{
            type: mongoose.Schema.Types.ObjectId ,
            ref: 'Workspace' ,
            require: true
        },
        create_at: {
            type: Date, 
            default: Date.now
        },
        role:{
            type: String,
            enum:['Owner','admin','user']
        }

    }
)

const MemberWorkspace = mongoose.model('MemberWorkspace',WorkspaceMemberSchema)

export default MemberWorkspace