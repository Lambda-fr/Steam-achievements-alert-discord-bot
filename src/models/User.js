import { getOwnedGames, getRecentlyPlayedGames } from '../steam/api.js';

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
    this.timePlayedByGame = {};
    this.displayedAchievements = [];
  }
  async getPlaytime() {
    try {
      const value = await getOwnedGames(this.steam_id);
      if (!value?.response?.games) {
        throw new Error("Response empty");
      }
      value.response.games.forEach(game => {
        this.timePlayedByGame[game.appid] = game.playtime_forever
        //get game icon
      });
      console.log(`Games playtime updated for ${this.nickname} (${this.steam_id})`);

    } catch (err) {
      console.error(`Error fetching games playtime for ${this.steam_id}, ${this.nickname} : ${err.message || err}`);
    }

  }

  async getRecentlyPlayedGames(Games) {
    try {
      const value = await getRecentlyPlayedGames(this.steam_id);
      this.recentlyPlayedGames = [];

      if (value.response && value.response.total_count > 0) {
        this.recentlyPlayedGames = value.response.games.map(game => {
          const matchGame = Games.find(g => g.id === String(game.appid));
          if (matchGame) {
            this.timePlayedByGame[game.appid] = game.playtime_forever
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