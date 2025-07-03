import { getOwnedGames, getRecentlyPlayedGames, getPlayerAchievements, getSchemaForGame } from '../steam/api.js';
import config from '../../config.json' with { type: 'json' };
import { getOrAddGame } from '../steam/appData.js';

class User {
  constructor(steam_id, discord_id, nickname, guilds, color) {
    this.steam_id = steam_id;
    this.discord_id = discord_id;
    this.nickname = nickname;
    this.guilds = guilds;
    this.color = color;
    this.avatar = null;
    this.newAchievements = [];
    this.displayedAchievements = [];
    this.ownedGames = [];
  }
  async updateOwnedGamesData(appData) {
    try {
      const value = await getOwnedGames(this.steam_id);
      if (!value?.response?.games) {
        console.warn(`No owned games found for ${this.nickname} (${this.steam_id})`);
        this.ownedGames = [];
        return false;
      }
      await Promise.all(value.response.games.map(async (gameData) => {

        let game = await getOrAddGame(appData, gameData.appid, gameData.img_icon_url ? `http://media.steampowered.com/steamcommunity/public/images/apps/${gameData.appid}/${gameData.img_icon_url}.jpg` : null, this.steam_id);
        if (game) {
          this.ownedGames.push(game.id);
          //console.log(`Game ${game.id} (${gameData.appid}) added for user ${this.nickname} (${this.steam_id})`);
          game.playtime[this.steam_id] = gameData.playtime_forever;
        }

      }));
      console.log(`Owned games data updated for ${this.nickname} (${this.steam_id})`);
      return true;

    } catch (err) {
      console.error(`Error fetching owned games data for ${this.steam_id}, ${this.nickname} : ${err}`);
      return false;
    }

  }

  async updateRecentlyPlayedGamesData(appData) {
    try {
      const value = await getRecentlyPlayedGames(this.steam_id);
      let gamesToAdd = [];
      let recentlyPlayedGames = [];

      if (value.response && value.response.total_count > 0) {
        await Promise.all(value.response.games.map(async (gameData) => {
          // Check if the gameId already exists in appData.games
          if (appData.invalidGames.includes(parseInt(gameData.appid))) {
            return;
          }
          const gameFound = appData.games.get(parseInt(gameData.appid));
          if (gameFound) {
            //console.warn(`Game with ID ${gameId} already exists in appData.`);
            if (!gameFound.img && gameData.img_icon_url) {
              gameFound.img = gameData.img_icon_url ? `http://media.steampowered.com/steamcommunity/public/images/apps/${gameData.appid}/${gameData.img_icon_url}.jpg` : null;
            }
            // If a userId is provided, update achievements for that user
            if (this.steam_id) {
              await gameFound.updateAchievementsForUser(appData, this.steam_id);
              gameFound.owned = true;
            }
          } else {
            gamesToAdd.push({ appid: gameData.appid, img_icon_url: gameData.img_icon_url ? `http://media.steampowered.com/steamcommunity/public/images/apps/${gameData.appid}/${gameData.img_icon_url}.jpg` : null, user: this, playtime: gameData.playtime_forever });
          }
          recentlyPlayedGames.push(`${gameData.appid} ${gameData.name ? gameData.name : ''}`);

        }));
      }

      console.log(`Recently played games [${this.nickname}] : ${recentlyPlayedGames.join(', ')}`);
      console.log(`Games to add for ${this.nickname} (${this.steam_id}) : ${gamesToAdd.map(g => g.appid).join(', ')}`);
      return gamesToAdd;

    } catch (err) {
      console.error(`Error fetching recently played games for ${this.nickname} (Steam ID: ${this.steam_id}):`, err.message || err);
      return [];
    }
  }

}



export default User