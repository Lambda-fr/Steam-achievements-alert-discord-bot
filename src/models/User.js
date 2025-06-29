import config from '../../config.json' with { type: 'json' };
const { API_Steam_key } = config;
import fetch from 'node-fetch';

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
      const response = await fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${API_Steam_key}&steamid=${this.steam_id}&format=json`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
      }
      const value = await response.json();
      if (!value?.response?.games) {
        throw new Error("Response empty");
      }
      value.response.games.forEach(game => {
        this.timePlayedByGame[game.appid] = game.playtime_forever
      });
      console.log(`Games playtime updated for ${this.nickname} (${this.steam_id})`);

    } catch (err) {
      console.error(`Error fetching games playtime for ${this.steam_id}, ${this.nickname} : ${err.message || err}`);
    }

  }

  async getRecentlyPlayedGames(Games) {
    try {
      const response = await fetch(`http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${API_Steam_key}&steamid=${this.steam_id}&format=json`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const value = await response.json();
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