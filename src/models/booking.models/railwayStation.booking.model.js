const mongoose = require("mongoose");

const railwayStationSchema = mongoose.Schema(
    {
        
        stationCode:{
            type:String,
            required:true,
        },
        stationName:{
            type:String, 
            required:true,
            lowercase:true,
        },
        location:{
            type:String, 
            required:true,
            lowercase:true,
        },
        trainsPassing:{
            type:Number
        },

    }
);

railwayStationSchema.index({location: "text"});
module.exports = mongoose.model("RailwayStation", railwayStationSchema);