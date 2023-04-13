// Get metadata
const meta = require('./metadata.json');

// Authenticate with the Spotify API and obtain an access token
// (this code assumes you already have a client ID and client secret)
const clientID = 'YOUR_CLIENT_ID_HERE';
const clientSecret = 'YOUR_CLIENT_SECRET_HERE';
const tokenEndpoint = 'https://accounts.spotify.com/api/token';
let accessToken = '';

async function getAccessToken() {
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${clientID}:${clientSecret}`)}`
    },
    body: 'grant_type=client_credentials'
  });
  const data = await response.json();
  accessToken = data.access_token;
}

// Retrieve the user's currently playing song details
async function getCurrentSong() {
  const currentlyPlayingEndpoint = 'https://api.spotify.com/v1/me/player/currently-playing';
  const response = await fetch(currentlyPlayingEndpoint, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  const data = await response.json();
  if (data.item !== null) {
    const artist = data.item.artists[0].name;
    const title = data.item.name;
    // Retrieve the lyrics of the currently playing song
    const lyricsEndpoint = `https://api.lyrics.ovh/v1/${artist}/${title}`;
    const response = await fetch(lyricsEndpoint);
    const data = await response.json();
    const lyrics = data.lyrics;
    // Update the user's Discord custom status with the lyrics
    const customStatus = {
      text: lyrics,
      type: 3 // indicates a custom status
    };
    discord.user.setPresence({ activity: customStatus });
  } else {
    const customStatus = {
      text: `Nothing playing on ${meta.name}`,
      type: 3
    };
    discord.user.setPresence({ activity: customStatus });
  }
}

// Get the access token and start checking for the currently playing song
getAccessToken().then(() => {
  setInterval(() => {
    getCurrentSong();
  }, 10000);
});
