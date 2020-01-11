let express = require('express');
let request = require('request');
let querystring = require('querystring');
var timexe = require('timexe');
const open = require('open');

// GLOBAL SETTINGS
let globalSettings = require('./Spotify.Nowplaying.Config');


let callbackServer = express();
let spotifyCallbackUri = `http://localhost:${globalSettings.spotify.callbackPort}/spotify_callback`;

// BASIC CALLBACK PAGE
callbackServer.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
})

// START AUTHORIZE
callbackServer.get('/spotify_autorize', function(req, res) {
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: globalSettings.spotify.clientId,
      scope: 'user-read-private user-read-email user-modify-playback-state user-read-currently-playing user-read-playback-state',
      redirect_uri: spotifyCallbackUri
    }))
})

// HANDLE CALLBACK
callbackServer.get('/spotify_callback', function(req, res) {
  let code = req.query.code || null
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: spotifyCallbackUri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer.from(
        globalSettings.spotify.clientId + ':' + globalSettings.spotify.clientSecret
      ).toString('base64'))
    },
    json: true
  }
  request.post(authOptions, function(error, response, body) {
    globalSettings.spotify.accessToken = body.access_token;
    globalSettings.spotify.refreshToken = body.refresh_token;
    globalSettings.spotify.tokenIssued = Date.now();
    globalSettings.spotify.tokenExpires = body.expires_in;

    res.redirect(`http://localhost:${globalSettings.spotify.callbackPort}/`);
  })
})

// CRONJOB (RUNS EVERY 2 SECONDS) YOU CAN RUN THIS EVERY SECOND IF YOU WANT.
// SPOTIFY'S API DOESN'T SUPPORT PUSH FUNCTIONS FROM THEIR END AS FAR AS I KNOW
timexe("* * * * * /2", function(){  
  cronAction();
});

// SPOTIFY FUNCTIONS
let spotifyFunctions = {
  // GET USER DETAILS
  getUserInfo: function(callback){

    if(globalSettings.spotify.accessToken != null){
      let requestOptions = {
        headers: {
          'Authorization': 'Bearer ' + globalSettings.spotify.accessToken,
        }
      }
    
      request.get('https://api.spotify.com/v1/me', requestOptions, function(req, res){
        callback(undefined, JSON.parse(res.body));        
      })
    }
    else{
      callback({error: 'No Accestoken present'}, undefined);
    } 
  },

  // GET CURRENT TRACK USER IS PLAYING
  getCurrentTrack: function(callback){
    if(globalSettings.spotify.accessToken != null){
      let requestOptions = {
        headers: {
          'Authorization': 'Bearer ' + globalSettings.spotify.accessToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    
      request.get('https://api.spotify.com/v1/me/player?market=NL', requestOptions, function(req, res){
    
        if(res.body != undefined){
          callback(undefined, JSON.parse(res.body))
        }
        
      })
    }
    else{
      callback({error: 'No Accestoken present'}, undefined);
    } 
  },

  // REFRESH ACCESS TOKEN
  refreshToken: function(){
    let authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        refresh_token: globalSettings.spotify.refreshToken,
        grant_type: 'refresh_token'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer.from(
          globalSettings.spotify.clientId + ':' + globalSettings.spotify.clientSecret
        ).toString('base64'))
      },
      json: true
    }
    request.post(authOptions, function(error, response, body) {    
      globalSettings.spotify.accessToken = body.access_token;
      globalSettings.spotify.tokenIssued = Date.now();
      globalSettings.spotify.tokenExpires = body.expires_in;
    });

    console.log('token Refreshed');
  },

  // START LOCAL CALLBACK SERVER
  startCallbackServer: function(){
    console.log(`Callback Server started: http://localhost:${globalSettings.spotify.callbackPort}/spotify_autorize`)
    callbackServer.listen(globalSettings.spotify.callbackPort);

  },

  // OPENCALLBACK PAGE AFTER RECEIVING TOKEN (OATH THINGY)
  openAuthorizeLink: function(){
    open(`http://localhost:${globalSettings.spotify.callbackPort}/spotify_autorize`);
  }
}

// CRONJOB ACTION
function cronAction(){
  // CHECK IF APP HAS AUTHORIZATION
  if(globalSettings.spotify.accessToken != null && globalSettings.spotify.refreshToken != null && globalSettings.spotify.tokenExpires != null){
    
    // CHECK IF TOKEN NEEDS REFRESH
    let timeToRefreshToken = globalSettings.spotify.tokenIssued + (globalSettings.spotify.tokenExpires * 1000) - globalSettings.spotify.refreshOffset;   
    if(Date.now() > timeToRefreshToken){
      spotifyFunctions.refreshToken();
    }

    // GET CURRENT TRACK USER IS PLAYING
    spotifyFunctions.getCurrentTrack(function(err, currentTrack){
      if(!err){

        // DO SOMETHING WITH NOW PLAYING DATA
        console.log(currentTrack);      
      }
    });
  }  
}


// START CALLBACK SERVER AND OPEN AUTHORIZE LINK
spotifyFunctions.startCallbackServer();
spotifyFunctions.openAuthorizeLink();