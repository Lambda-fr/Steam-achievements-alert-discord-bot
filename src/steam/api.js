import fetch from 'node-fetch';
import { loadImage } from "canvas";
import config from '../../config.json' with { type: 'json' };
const { API_Steam_key } = config;

async function isPublicProfile(steamUserId) {
  // Check if a Steam profile is public by requesting achievements
  try {
    let result = await fetch(`http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=440&key=${API_Steam_key}&steamid=${steamUserId}`)
      .then(async res => await res.json());
    if (result.playerstats && result.playerstats.success === false) {
      return 0; // Profile not public
    }
    return 1;
  } catch (error) {
    console.log(`API error : ${error}`); // API Error or no such steam id
    return -1;
  }
}

async function loadAvatars(users) {
  // Fetch avatars for a list of users and update their avatar property
  let ids = "";
  users.forEach(user => ids += user.steam_id + ",");
  try {
    const res = await fetch(
      "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" +
      API_Steam_key +
      "&steamids=" +
      ids
    );
    if (!res.ok) {
      throw new Error("Failed to fetch player summaries");
    }
    const value = await res.json();
    if (!value.response || !value.response.players) {
      console.error("Malformed response from Steam API");
      return;
    }
    await Promise.all(value.response.players.map(async (_user) => {
      try {
        const img = await loadImage(_user.avatarfull);
        const foundUser = users.find(user => user.steam_id === _user.steamid);
        if (foundUser) {
          foundUser.avatar = img;
          console.log(`Avatar updated for ${foundUser.nickname}`);
        } else {
          console.warn(`User with steamid ${_user.steamid} not found in users array`);
        }
      } catch (err) {
        console.error(`Error loading avatar image for steamid ${_user.steamid}:`, err);
      }
    }));
  } catch (err) {
    console.error("Error in getAvatars:", err);
  }
}

async function verifyAvatars(users) {
  // Verify if avatars are loaded for all users, and load default avatar if not
  await Promise.all(users.map(async user => {
    if (typeof user.avatar === 'undefined') {
      console.warn(`Avatar not found for user ${user.nickname}. Loading default avatar.`);
      user.avatar = await loadImage('https://cdn.discordapp.com/embed/avatars/0.png');
    }
  }));
}

async function isGameIdValid(game_id) {
  // Check if a game ID is valid by requesting its schema
  try {
    const res = await fetch(`http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?appid=${game_id}&key=${API_Steam_key}`);
    if (res.ok) {
      const value = await res.json();
      if (!value?.game?.availableGameStats?.achievements || Object.keys(value.game.availableGameStats.achievements).length == 0) {
        return 0;
      }
      return 1;
    } else {
      return -1;
    }
  } catch (err) {
    console.error(`Error validating game id ${game_id}:`, err);
    return -1;
  }
}

export { loadAvatars, verifyAvatars, isPublicProfile, isGameIdValid };
