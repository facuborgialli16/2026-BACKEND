import mongoose from "mongoose";

const WorkspaceSchema = new mongoose.Schema(
    {
        fk_id_owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User' ,
            require: true
        },
        title:{
            type: String, 
            required: true
        },
        description:{
            type: Text, 
            required: false
        },
        image:{
            type: Text, 
            required: false
        },
        create_at:{
            type: Date, 
            default: Date.now
        },
        active:{
            type: Boolean, 
            default: true
        },

    }
)

const Workspace  = mongoose.model('Workspace',WorkspaceSchema)

export default Workspace