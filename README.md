# Spotify.Nowplaying
Add Spotify Nowplaying function from the user to your NodeJS or ElectronJS project.

Let the user authorize their account to get the current track they're playing in spotify.

I made this as a successor for [Toastify](https://github.com/aleab/toastify/releases) as I needed more info from the user besides the title and artist of a track.

## Installation

Use NPM install to get all the packages.

```bash
npm install
```

## Configuration
Add 2 enviroment variables or a .env file with the Spotify ClientID and Client Secret.

You can get them by creating a Spotify app in the developers portal at the Spotify website

Add a callback url which mimics your local configuration (standard port 8003)

* Callback URL: **http://localhost:8003/spotify_callback**

* Scopes: **user-read-private user-read-email user-modify-playback-state user-read-currently-playing user-read-playback-state**

[Spotify Development Console](developer.spotify.com)


```
SPOTIFY_CLIENT_ID=************
SPOTIFY_CLIENT_SECRET=************
```

You can change the config to your own liking.
* The callback server defaults on port 8003
* The accessToken is refreshed 10 seconds before the current one expires

## Usage
The script already works standalone. Just run **Spotify.Nowplaying.js** in node.

If you added all the credentials just start with node.

Now playing will *console.log()* every 2 seconds.

```node
node ./Spotify.Nowplaying.js
```

It also creates the callback server on the port you defined in the config

## Functions

The action that runs every 2 seconds if authorization code is present:
```node
cronAction()
```

Return current user info:
```node
spotifyFunctions.getUserInfo();
```

Return current Now Playing info:
```node
spotifyFunctions.getCurrentTrack();
```


Refresh authorisation token **// Will run in CronJob**::
```node
spotifyFunctions.refreshToken();
```

Start callback server **// Will run at start**:
```node
spotifyFunctions.startCallbackServer();
```

Open callback link **// Will run at when accessToken is received**:
```node
spotifyFunctions.openAuthorizeLink();
```


## License
[MIT](https://choosealicense.com/licenses/mit/)

## Thanks
Thanks to the guys at [DevTips](https://www.youtube.com/user/DevTipsForDesigners) for clarifying the authorisation process.
