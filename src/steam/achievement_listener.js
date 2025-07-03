import { displayNewAchievementImage } from '../discord/image_generation.cjs';
import { getOrAddGame } from '../steam/appData.js';

async function updateAllUsersAchievements(appData) {
  appData.tLookback = appData.tLookback + 60;
  console.log(`lookback :${appData.tLookback}`);

  // Collect all games to add after all user updates
  const gamesToAdd = [];

  await Promise.all(appData.users.map(async user => {
    try {
      // updateRecentlyPlayedGamesData returns a list of games to add
      const games = await user.updateRecentlyPlayedGamesData(appData);
      gamesToAdd.push(...games);
    } catch (err) {
      console.error(`Error processing user ${user.nickname}:`, err);
    }
  }));

  // Sequentially add games using getOrAddGame
  for (const gameToAdd of gamesToAdd) {
    //gameToAdd structure : { appid, img_icon_url, user, playtime }
    let game = await getOrAddGame(appData, gameToAdd.appid, gameToAdd.img_icon_url, gameToAdd.user.steam_id);
    if (game) {
      if (!gameToAdd.user.ownedGames.includes(game.id)) {
        gameToAdd.user.ownedGames.push(game.id);
      }
      game.playtime[gameToAdd.user.steam_id] = gameToAdd.playtime;
    }
  }
}

async function processAndDisplayNewAchievements(appData) {
  const new_achievements = appData.users.map(user => user.newAchievements.reverse().map(a => [user, a])).flat(1); // Flatten the array to get a list of new achievements with user context
  console.log(`Nb new achievements to display : ${new_achievements.length}`);

  for (const newA of new_achievements) {
    for (const guild_id of newA[0].guilds) {
      const guild = appData.guilds.find(g => g.id === guild_id);
      if (typeof guild === 'undefined' || typeof guild.channel === 'undefined' || typeof guild.channel_id === 'undefined') {
        continue;
      }
      const game = appData.games.get(newA[1].gameId);
      if (game.guilds.includes(guild_id)) {
        try {
          await displayNewAchievementImage(newA[1].object, game, appData.users, guild, newA[0], newA[1].pos);
        } catch (err) {
          console.error(`Error displaying new achievement in Discord for guild ${guild_id}:`, err);
        }
      }
    }
  }
  // Reset newAchievements array for all users
  for (const user of appData.users) {
    user.newAchievements = [];
  }
}

function listenForNewAchievements(appData) {
  // Listen for new achievements and handle Discord notifications
  console.log('listening to new achievements...');

  setInterval(async function () {
    try {
      await updateAllUsersAchievements(appData);
      await processAndDisplayNewAchievements(appData);
    } catch (err) {
      console.error("Error in listenForNewAchievements interval:", err);
    }
  }, 60000);
}

export { listenForNewAchievements };