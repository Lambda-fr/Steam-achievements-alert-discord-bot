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
    await Promise.all(users.map(async user => {
      const _user = value.response.players.find(p => p.steamid === user.steam_id);
      if (_user) {
        try {
          user.avatar = await loadImage(_user.avatarfull);
          console.log(`Avatar updated for ${user.nickname}`);
        } catch (err) {
          console.warn(`Error loading avatar image for steamid ${user.steam_id}. Loading default avatar.`, err);
          user.avatar = await loadImage('https://cdn.discordapp.com/embed/avatars/0.png');
        }
      } else {
        console.warn(`User with steamid ${user.steam_id} not found in Steam API response. Loading default avatar.`);
        user.avatar = await loadImage('https://cdn.discordapp.com/embed/avatars/0.png');
      }
    }));
  } catch (err) {
    console.error("Error in getAvatars:", err);
  }
}

async function isGameIdValid(game_id) {
  // Check if a game ID is valid by requesting its schema
  try {
    const res = await fetch(`http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?appid=${game_id}&key=${API_Steam_key}`);
    if (!res.ok) return false;
    const value = await res.json();
    if (!value || !value.game || !value.game.availableGameStats || !value.game.availableGameStats.achievements || (value.game.availableGameStats.achievements.length < 1)) {
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Error validating game id ${game_id}:`, err);
    return false;
  }
}

async function getPlayerAchievements(appId, steamId, lang) {
  try {
    const res = await fetch(`http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${appId}&key=${API_Steam_key}&steamid=${steamId}&l=${lang}`);
    return await res.json();
  } catch (err) {
    console.error(`Error in getPlayerAchievements for appId ${appId}, steamId ${steamId}:`, err);
    throw err;
  }
}

async function getGlobalAchievementPercentagesForApp(gameId) {
  try {
    const res = await fetch(`http://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=${gameId}&format=json`);
    if (!res.ok) {
      throw new Error(`Error fetching global achievement percentages (HTTP ${res.status})`);
    }
    return await res.json();
  } catch (err) {
    console.error(`Error in getGlobalAchievementPercentagesForApp for gameId ${gameId}:`, err);
    throw err;
  }
}

async function getSchemaForGame(appId) {
  try {
    const res = await fetch(`http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?appid=${appId}&key=${API_Steam_key}&l=french`);
    if (!res.ok) {
      throw new Error(`Error fetching game schema (HTTP ${res.status})`);
    }
    return await res.json();
  } catch (err) {
    console.error(`Error in getSchemaForGame for appId ${appId}:`, err);
    throw err;
  }
}

async function getOwnedGames(steamId) {
  try {
    const response = await fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${API_Steam_key}&steamid=${steamId}&format=json&include_appinfo=true`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.error(`Error fetching owned games for steamId ${steamId}:`, err.message || err);
    throw err;
  }
}

async function getRecentlyPlayedGames(steamId) {
  try {
    const response = await fetch(`http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${API_Steam_key}&steamid=${steamId}&format=json&include_appinfo=true`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error(`Error fetching recently played games for steamId ${steamId}:`, err.message || err);
    throw err;
  }
}

export { loadAvatars, isPublicProfile, isGameIdValid, getPlayerAchievements, getGlobalAchievementPercentagesForApp, getSchemaForGame, getOwnedGames, getRecentlyPlayedGames };
