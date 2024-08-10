const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
    {
        hotelId:{
            type:String,
            required:true,
            trim:true,
            index:true,
        },
        
        name:{
            type:String,
            required:true,
        },
        type:{
            type:String,
        },
        starRating:{
            type:Number,
        },
        lat:{
            type:Number,
        },
        lng:{
            type:Number,
        },
        city:{
            type:Number,
        },
        address:{
            type:Number,
        },
        images:[{
            type:String,
        }],
        pricePerNight:{
            type:Number,
        },
        available:{
            type:Boolean,
        },
        amenities:{
            type:Object,
        },

    },
    {
        timeStamps: true
    }
);

module.exports =  mongoose.model("Hotel", reelSchema);
