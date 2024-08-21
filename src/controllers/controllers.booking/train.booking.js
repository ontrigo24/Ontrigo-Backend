const {RailwayStation} = require("../../models");
const { asyncHandler } = require("../../utils");


exports.stationAutocomplete = asyncHandler(async(req, res, next)=>{


})

exports.getTrainsBetweenStations = asyncHandler(async(req, res, next)=>{

    const {fromStation, toStation, travelDate} = req.body;

    const url = `https://irctc1.p.rapidapi.com/api/v3/trainBetweenStations?fromStationCode=${fromStation}&toStationCode=${toStation}&dateOfJourney=${travelDate}`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': process.env.TRAIN_API_KEY,
            'x-rapidapi-host': process.env.TRAIN_API_HOST_NAME,
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.text();
        console.log(result);
    } catch (error) {
        console.error(error);
    }    
})

