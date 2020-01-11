require('dotenv').config();

module.exports = {
    spotify: {
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        accessToken: null,
        refreshToken: null,
        tokenIssued: null,
        tokenExpires: null,
        refreshOffset: 10000, // refresh 10 seconds before token expires
        callbackPort: 8003
    }
}