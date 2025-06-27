import fetch from 'node-fetch';
import { loadImage } from "canvas";
import config from '../config.json' with { type: 'json' };
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

function listenForNewAchievements(globalVariables) {
  // Listen for new achievements and handle Discord notifications
  console.log('listening to new achievements...');

  setInterval(async function () {
    try {
      console.log(`Games list : ${globalVariables.Games.map(game => game.name)}`);
      globalVariables.t_lookback = globalVariables.t_lookback + 60;
      console.log(`lookback :${globalVariables.t_lookback}`);
      await Promise.all(globalVariables.Users.map(async user => {
        try {
          await user.getRecentlyPlayedGames(globalVariables.Games);
          await Promise.all(user.recentlyPlayedGames.map(async game => {
            try {
              await game.updateAchievements(user, globalVariables.t_lookback, false);
            } catch (err) {
              console.error(`Error updating achievements for game ${game.name}:`, err);
            }
          }));
        } catch (err) {
          console.error(`Error processing user ${user.nickname}:`, err);
        }
      }));

      // This is not clean: mutating user.newAchievements in place and reversing it
      // Consider refactoring to avoid side effects
      const new_achievements = globalVariables.Users.map(user => user.newAchievements.reverse().map(a => [user, a])).flat(1);
      console.log(`Nb new achievements to display : ${new_achievements.length}`);
      if (new_achievements.length > 0) {
        await Promise.all(globalVariables.Games.map(async game => {
          try {
            await game.updateGlobalPercentage();
            // await game.getAchievementsIcon()
          } catch (err) {
            console.error(`Error updating global percentage for game ${game.name}:`, err);
          }
        }));
      }

      let guild;

      for (const newA of new_achievements) {
        for (const guild_id of newA[0].guilds) {
          guild = globalVariables.Guilds.find(g => g.id === guild_id);
          if (typeof guild === 'undefined') {
            continue;
          }
          // Use logical OR, not bitwise OR
          if (typeof guild.channel === 'undefined' || typeof guild.channel_id === 'undefined') {
            continue;
          }

          if (newA[1].object.game.guilds.includes(guild_id)) {
            try {
              await newA[1].object.displayDiscordNewAchievement(globalVariables.Users, guild, newA[0], newA[1].pos);
            } catch (err) {
              console.error(`Error displaying new achievement in Discord for guild ${guild_id}:`, err);
            }
          }
        }
      }
      // Reset newAchievements array for all users
      for (const user of globalVariables.Users) {
        user.newAchievements = [];
      }
    } catch (err) {
      console.error("Error in listenForNewAchievements interval:", err);
    }
  }, 60000);
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


export { loadAvatars, verifyAvatars, listenForNewAchievements, isPublicProfile, isGameIdValid };