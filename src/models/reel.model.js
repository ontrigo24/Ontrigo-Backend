const mongoose = require("mongoose");

const reelSchema = new mongoose.Schema(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        title:{
            type:String,
            required:[true, "reel title is required"]
        },
        description:{
            type:String, 
            required:[true, "reel description is required"]
        },
        thumbnail:{
            type:String,
            required:true,
            trim:true,
        },
        videoUrl:{
            type:String,
            required:true,
            trim:true
        },
        tags:[{
            type:String,
            lowercase:true,
            trim:true,
        }],
        comments:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Comment",
            default:[],
        }],
        likes:[{
            type:mongoose.Schema.Types.ObjectId
        }],
        archived:{
            type:Boolean,
            default:false,
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Reel", reelSchema);
