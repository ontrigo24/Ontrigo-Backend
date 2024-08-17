const {asynHandler, ApiResponse, ApiError, asyncHandler} = require("../utils");
const { getJson } = require("serpapi");
// hotel booking

exports.getHotels = asyncHandler(async(req, res, next)=>{

    const {city, checkIn, checkOut, currency, adults, childrenAge, maxPrice, amenities} = req.body;

    if(!city || !checkIn || !checkOut || !adults || !maxPrice){
        throw new ApiError(400, "Please provide all required fields");
    }
   
    let data;

    await getJson({
        api_key: process.env.SERP_API_KEY,
        engine: "google_hotels",
        q: city,
        hl: "en",
        gl: "in",
        check_in_date: checkIn,
        check_out_date: checkOut,
        currency: currency ? currency : "INR",
        adults: adults,
        children: childrenAge ? childrenAge.split(",").length : undefined,
        children_ages: childrenAge ? childrenAge : undefined,
        max_price: maxPrice,
        amenities: amenities ? amenities : undefined,
    }, (fetchedData) => {
        
        if(!fetchedData || !fetchedData.properties || fetchedData.properties.length === 0){
            throw new ApiError(500, "Something went wrong while fetching data");
        }
        data = fetchedData.properties;
    });

    data.forEach((hotel)=>{
        hotel.rate_per_night = {
            lowest : hotel.rate_per_night.extracted_lowest,
            before_taxes: hotel.rate_per_night.extracted_before_taxes_fees
        }

        hotel.total_rate = {
            lowest : hotel.total_rate.extracted_lowest,
            before_taxes : hotel.total_rate.extracted_before_taxes_fees
        }

        hotel.hotel_class = hotel.extracted_hotel_class;

        hotel.images = hotel.images.map((imageObj)=> imageObj.original_image);

        hotel.property_details_url = hotel.serpapi_property_details_link;

        hotel.reviews_breakdown = hotel.reviews_breakdown?.map((review)=>({
            name : review.name,
            positive : Math.round(((review.positive/review.total_mentioned)*100)),
        }))


        // undefinds
        hotel.property_token = undefined;
        hotel.ratings = undefined;
        hotel.extracted_hotel_class = undefined;
        hotel.serpapi_property_details_link = undefined;




    });

    console.log(data);

    return res.status(200).json(
        new ApiResponse(200, data, "hotels data fetched successully")
    )

})

