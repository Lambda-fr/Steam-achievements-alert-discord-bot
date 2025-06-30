

async function updateAllUsersAchievements(appData) {
  console.log(`Games list : ${appData.games.map(game => game.name)}`);
  appData.tLookback = appData.tLookback + 60;
  console.log(`lookback :${appData.tLookback}`);
  await Promise.all(appData.users.map(async user => {
    try {
      await user.getRecentlyPlayedGames(appData.games);
      await Promise.all(user.recentlyPlayedGames.map(async game => {
        try {
          await game.updateAchievementsForUser(user, appData.tLookback, false);
        } catch (err) {
          console.error(`Error updating achievements for game ${game.name}:`, err);
        }
      }));
    } catch (err) {
      console.error(`Error processing user ${user.nickname}:`, err);
    }
  }));
}

async function processAndDisplayNewAchievements(appData) {
  const new_achievements = appData.users.map(user => user.newAchievements.reverse().map(a => [user, a])).flat(1);
  console.log(`Nb new achievements to display : ${new_achievements.length}`);

  for (const newA of new_achievements) {
    for (const guild_id of newA[0].guilds) {
      const guild = appData.guilds.find(g => g.id === guild_id);
      if (typeof guild === 'undefined' || typeof guild.channel === 'undefined' || typeof guild.channel_id === 'undefined') {
        continue;
      }

      if (newA[1].object.game.guilds.includes(guild_id)) {
        try {
          await newA[1].object.displayDiscordNewAchievement(appData.users, guild, newA[0], newA[1].pos);
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