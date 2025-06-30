import { getOwnedGames, getRecentlyPlayedGames, getPlayerAchievements, getSchemaForGame } from '../steam/api.js';
import config from '../../config.json' with { type: 'json' };

class User {
  constructor(steam_id, discord_id, nickname, guilds, color) {
    this.steam_id = steam_id;
    this.discord_id = discord_id;
    this.nickname = nickname;
    this.guilds = guilds;
    this.color = color;
    this.avatar;
    this.recentlyPlayedGames = [];
    this.newAchievements = [];
    this.displayedAchievements = [];
    this.ownedGames = [];
  }
  async updateOwnedGamesData() {
    try {
      const value = await getOwnedGames(this.steam_id);
      if (!value?.response?.games) {
        throw new Error("Response empty");
      }
      this.ownedGames = [];
      await Promise.all(value.response.games.map(async (game) => {
        let nbTotalAchievements = 0;
        let nbUnlockedAchievements = 0;
        let isCompleted100Percent = false;

        try {
          const playerAchievements = await getPlayerAchievements(game.appid, this.steam_id, config.lang);
          if (playerAchievements?.playerstats?.achievements) {
            nbTotalAchievements = playerAchievements.playerstats.achievements.length;
            nbUnlockedAchievements = playerAchievements.playerstats.achievements.filter(a => a.achieved === 1).length;
            if (nbTotalAchievements > 0 && nbUnlockedAchievements === nbTotalAchievements) {
              isCompleted100Percent = true;
            }
          }
        } catch (err) {
          console.warn(`Could not get achievement info for game (${game.appid}):`, err.message);
        }

        this.ownedGames.push({
          id: game.appid,
          name: game.name,
          img: game.img_icon_url ? `http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg` : null,
          playtime: game.playtime_forever,
          nbTotalAchievements: nbTotalAchievements,
          nbUnlockedAchievements: nbUnlockedAchievements,
          isCompleted100Percent: isCompleted100Percent,
        });
      }));

      console.log(`Owned games, game playtime, and achievement status updated for ${this.nickname} (${this.steam_id})`);
      return true;

    } catch (err) {
      console.error(`Error fetching owned games, game playtime, and achievement status for ${this.steam_id}, ${this.nickname} : ${err.message || err}`);
      return false;
    }

  }

  async updateRecentlyPlayedGamesData(Games) {
    try {
      const value = await getRecentlyPlayedGames(this.steam_id);
      this.recentlyPlayedGames = [];

      if (value.response && value.response.total_count > 0) {
        this.recentlyPlayedGames = value.response.games.map(game => {
          const matchGame = Games.find(g => g.id === String(game.appid));
          if (matchGame) {

            return matchGame;
          }
        }).filter(notUndefined => notUndefined !== undefined);
      }

      console.log(`Recently played games [${this.nickname}] : ${this.recentlyPlayedGames.map(g => g.name).join(', ')}`);
      return this.recentlyPlayedGames;

    } catch (err) {
      console.error(`Error fetching recently played games for ${this.nickname} (Steam ID: ${this.steam_id}):`, err.message || err);
      return [];
    }
  }

}



export default User