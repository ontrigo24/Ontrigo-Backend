const mongoose = require("mongoose");

const reelSchema = mongoose.Schema(
    {
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
        }
    },
    {
        timeStamps: true
    }
);

module.exports = mongoose.model("Reel", reelSchema);
