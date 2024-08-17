const mongoose = require("mongoose");

const commentSchema = mongoose.Schema(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        body:{
            type:String,
            trim:true,
            required:true,
        },

    },
    {
        timestamps:true,
    }
);

module.exports = mongoose.model("Comment", commentSchema);