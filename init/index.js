if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mapToken ? mbxGeocoding({ accessToken: mapToken }) : null;

async function getSeedUser() {
    let user = await User.findOne({ username: "seed" });
    if (!user) {
        const newUser = new User({ username: "seed", email: "seed@example.com" });
        user = await User.register(newUser, "seed12345");
    }
    return user;
}

async function getGeometry(listing) {
    if (listing.geometry) return listing.geometry;
    if (!geocodingClient) {
        return { type: "Point", coordinates: [0, 0] };
    }

    try {
        const response = await geocodingClient
            .forwardGeocode({
                query: `${listing.location}, ${listing.country}`,
                limit: 1,
            })
            .send();

        const geometry = response.body.features[0]?.geometry;
        return geometry || { type: "Point", coordinates: [0, 0] };
    } catch (err) {
        return { type: "Point", coordinates: [0, 0] };
    }
}

async function initDB() {
    await Listing.deleteMany({});
    const seedUser = await getSeedUser();

    const seededListings = [];
    for (const listing of initData.data) {
        const geometry = await getGeometry(listing);
        seededListings.push({
            ...listing,
            owner: seedUser._id,
            geometry,
        });
    }

    await Listing.insertMany(seededListings);
    console.log("data was initialized");
}

async function main() {
    await mongoose.connect(dbUrl);
    console.log("connected to DB");
    await initDB();
    await mongoose.connection.close();
}

main().catch((err) => console.log(err));
