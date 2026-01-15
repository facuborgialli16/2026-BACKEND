import mongoose from "mongoose";

const channelsSchema = new mongoose.Schema(
    {
        fk_id_workspace:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true
            },
        name:{
            type:String,
            required:true
        },
        create_at: {
            type: Date, 
            default: Date.now
        },
        active:{
            type: Boolean, 
            default: true
        },

    }
)

const Channel = mongoose.model('Channels', channelsSchema)

export default Channel