import { getPlayerAchievements, getGlobalAchievementPercentagesForApp, getSchemaForGame } from '../steam/api.js';
import config from '../../config.json' with { type: 'json' };

class Game {
    constructor(id, img = null) {
        this.id = parseInt(id);
        this.name = '';
        this.aliases = [];
        this.realName = '';
        this.guilds = [];
        this.achievements = {}; //Dictionary of achievements; used only if inGuildsGameList is true
        this.nbUnlocked = {}; //Dictionary user steam id with the number of achievements unlocked
        this.playtime = {}; //Dictionary user steam id with the playtime
        this.isCompleted100Percent = {}; //Dictionary user steam id with a boolean
        this.img = img;
        this.nbTotal = 0;
        this.owned = false;
    }

    async updateAchievementsForUser(appData, userId) { //TO DO : And get Achievements qui respectent l'intervalle de temps demandé.
        // Skip if the user does not own this game
        try {
            const lastScan = appData.tLookback;
            const user = appData.users.find(u => u.steam_id === userId);
            const playerAchievements = await getPlayerAchievements(this.id, user.steam_id, config.lang);
            if (!playerAchievements || !playerAchievements.playerstats || !playerAchievements.playerstats.achievements) {
                throw new Error(`No achievements found for game ${this.id} for user ${user.steam_id}`);
            }
            this.nbTotal = playerAchievements.playerstats.achievements.length;
            this.realName = playerAchievements.playerstats.gameName;

            let nbUnlockedAchievements = 0;
            let nbNewAchievements = 0;
            let achievementsNeedIcons = false;
            for (const a of playerAchievements.playerstats.achievements) {
                if (a.unlocktime !== 0) {
                    nbUnlockedAchievements++;
                }
                if (!this.achievements[a.apiname]) {
                    this.achievements[a.apiname] = {
                        achievementName: a.name,
                        achievementDescription: a.description,
                        playersUnlockTime: {},
                        globalPercentage: undefined,
                        icon: undefined
                    };
                    achievementsNeedIcons = true;
                }
                this.achievements[a.apiname].playersUnlockTime[user.steam_id] = a.unlocktime;

                if (a.unlocktime > lastScan) {
                    const lclId = `${this.id}_${a.apiname}`;
                    if (!user.displayedAchievements.includes(lclId)) {
                        user.newAchievements.push({ object: this.achievements[a.apiname], gameId: this.id, pos: nbNewAchievements });
                        user.displayedAchievements.push(lclId);
                        nbNewAchievements++;
                    }
                }
            }

            if (achievementsNeedIcons) {
                await this.getAchievementsIcon();
                await this.updateGlobalPercentage();
            }
            this.nbUnlocked[user.steam_id] = nbUnlockedAchievements;
            this.isCompleted100Percent[user.steam_id] = nbUnlockedAchievements === this.nbTotal;
            if (nbNewAchievements > 0) {
                console.log(`${nbNewAchievements} new achievements\t${this.id} (${this.realName})\t\t${user.steam_id} (${user.nickname})`);
            }
            return true;

        } catch (err) {
            console.error(`updateAchievementsForUser error for game ${this.id} and user ${userId}:`, err);
            return false;
        }
    }

    async updateGlobalPercentage() {
        const id = this.id;
        try {
            const value = await getGlobalAchievementPercentagesForApp(id);
            for (const a of value.achievementpercentages.achievements) {
                if (this.achievements[a.name]) {
                    this.achievements[a.name].globalPercentage = parseFloat(a.percent).toFixed(1);
                }
            }
        } catch (err) {
            console.error(`updateGlobalPercentage error for ${id}:`, err);
            return false;
        }
        return true;
    }

    async getAchievementsIcon() {
        const id = this.id;
        const name = this.name;
        try {
            const value = await getSchemaForGame(id);
            if (!value.game?.availableGameStats?.achievements) {
                throw new Error('No achievements found in schema');
            }
            for (const a of value.game.availableGameStats.achievements) {
                if (this.achievements[a.name]) {
                    this.achievements[a.name].icon = a.icon;
                }
            }
        } catch (err) {
            console.error(`getAchievementsIcon error for ${id}, ${name}:`, err);
            return false;
        }
        return true;
    }

    async getRealName() {
        const id = this.id;
        const name = this.name;
        try {
            const value = await getSchemaForGame(id);
            if (value.game?.gameName) {
                this.realName = value.game.gameName;
            }
        } catch (err) {
            console.error(`getRealName error for ${id}, ${name}:`, err);
            return false;
        }
        return true;
    }

    getCompareAchievements(userAuthor, guildUsers, vsUser) {
        const vsUserSteamID = vsUser ? vsUser.steam_id : null;
        return Object.values(this.achievements)
            .filter(a => a.playersUnlockTime[userAuthor.steam_id] === 0 &&
                (!vsUserSteamID || a.playersUnlockTime[vsUserSteamID] !== 0))
            .map(a => {
                const playersWhoUnlocked = guildUsers.filter(u =>
                    a.playersUnlockTime[u.steam_id] ? a.playersUnlockTime[u.steam_id] !== 0 : false
                );
                if (playersWhoUnlocked.length > 0) {
                    return { object: a, playersWhoUnlocked };
                }
            })
            .filter(Boolean); // Filter out any undefined values
    }

    getLockedAchievements(userAuthor, guildId, usersData, other_users) {
        var validAchievements = Object.entries(this.achievements).map(([a_id, a]) => {
            if (a.playersUnlockTime[userAuthor.steam_id] === 0 || other_users.filter(u => a.playersUnlockTime[u.steam_id] === 0).length > 0) {
                const playersWhoUnlocked = Object.entries(a.playersUnlockTime).map(([u, unlocked_time]) => {
                    const userObject = usersData.find(_u => _u.steam_id === u)
                    if (unlocked_time != 0 && userObject.guilds.includes(guildId)) {
                        return usersData.find(_u => _u.steam_id === u)
                    }
                }).filter(notUndefined => notUndefined !== undefined);
                return { object: a, playersWhoUnlocked: playersWhoUnlocked }
            }

        }).filter(notUndefined => notUndefined !== undefined);
        return validAchievements
    }

    getAllAchievements(guildId, usersData) {
        var validAchievements = Object.entries(this.achievements).map(([a_id, a]) => {
            const playersWhoUnlocked = Object.entries(a.playersUnlockTime).map(([u, unlocked_time]) => {
                const userObject = usersData.find(_u => _u.steam_id === u)
                if (unlocked_time != 0 && userObject.guilds.includes(guildId)) {
                    return usersData.find(_u => _u.steam_id === u)
                }
            }).filter(notUndefined => notUndefined !== undefined);
            return { object: a, playersWhoUnlocked: playersWhoUnlocked }

        }).filter(notUndefined => notUndefined !== undefined);

        return validAchievements
    }

    getAchievementsHistory(guildId, usersData) {
        try {
            let timestamp_history = {} //Dict with list of timestamps of achievements unlock time for each player(key)
            let all_timestamps = []
            const guild_users = []

            let nbAchievementsList = {}
            Object.keys(this.nbUnlocked).forEach(userSteamID => {
                const user = usersData.find(u => u.steam_id === userSteamID);
                if (user && user.guilds.includes(guildId)) {
                    timestamp_history[userSteamID] = []
                    nbAchievementsList[userSteamID] = []
                    guild_users.push(userSteamID)
                }
            });

            for (const achievement of Object.values(this.achievements)) {
                for (const [userSteamID, userUnlockTime] of Object.entries(achievement.playersUnlockTime)) {
                    if (userUnlockTime != 0 && guild_users.includes(userSteamID)) {
                        timestamp_history[userSteamID].push(userUnlockTime)
                        if (!all_timestamps.includes(userUnlockTime)) {
                            all_timestamps.push(userUnlockTime)
                        }
                    }
                }
            }
            all_timestamps.sort(function (a, b) {
                return a - b;
            });

            let all_timestamps_temp = []
            all_timestamps.forEach(timestamp => {
                all_timestamps_temp.push(timestamp - 1)
                all_timestamps_temp.push(timestamp)
                for (const [userSteamID, timestampsUser] of Object.entries(timestamp_history)) {
                    const last_nb = nbAchievementsList[userSteamID].length == 0 ? 0 : nbAchievementsList[userSteamID].at(-1)
                    nbAchievementsList[userSteamID].push(last_nb)
                    const new_nb = last_nb + timestampsUser.filter((x) => x == timestamp).length
                    nbAchievementsList[userSteamID].push(new_nb)
                }
            });

            all_timestamps = all_timestamps_temp.map((timestamp) => new Date(timestamp * 1000))


            for (const [userSteamID, timestampsUser] of Object.entries(timestamp_history)) {
                const last_nb = nbAchievementsList[userSteamID].length == 0 ? 0 : nbAchievementsList[userSteamID].at(-1)
                nbAchievementsList[userSteamID].push(last_nb)
            }

            all_timestamps.push(Date.now())

            let datasets = []

            for (const userSteamID of guild_users) {
                const user = usersData.find(u => u.steam_id === userSteamID);
                if (user) {
                    datasets.push({
                        data: nbAchievementsList[userSteamID],
                        borderColor: user.color,
                        label: user.nickname
                    })
                }

            }
            return [all_timestamps, datasets, this.realName];

        } catch (err) {
            console.error(`displayAchievementsHistory error for ${this.id}:`, err);
        }
    }

}
export default Game;