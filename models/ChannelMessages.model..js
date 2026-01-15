import mongoose from "mongoose";

const ChannelMessagesShema = new mongoose.Schema(
    {
        fk_id_channel:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Channels',
            require: true
        },
        fk_id_member:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MemberWorkspace',
            require: true
        },
        message:{
            type:String,
            required:true
        },
        create_at: {
            type: Date, 
            default: Date.now
        },

    }
)

const ChannelMessages = mongoose.model('ChannelMessages', ChannelMessagesShema)

export default ChannelMessages  