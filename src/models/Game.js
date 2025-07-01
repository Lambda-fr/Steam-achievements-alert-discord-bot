import { getPlayerAchievements, getGlobalAchievementPercentagesForApp, getSchemaForGame } from '../steam/api.js';

class Game {
    constructor(name, id, guilds, aliases) {
        this.id = id;
        this.name = name;
        this.aliases = aliases;
        this.realName = '';
        this.guilds = guilds;
        this.achievements = {}; //Dictionnaire achievements ; used only if inGuildsGameList is true
        this.nbUnlocked = {}; //Dictionnaire user steam id avec l'objet user
        this.nbTotal = 0;
    }

    async updateAchievementsForUser(user, last_scan, start = false, lang) {
        // Skip if the user does not own this game
        try {
            const value = await getPlayerAchievements(this.id, user.steam_id, lang);
            if (!value.playerstats.success) {
                if (value.playerstats.error === "Requested app has no stats") {
                    //User doesn't own this game. Skipping
                    return true;
                }
                throw new Error(`${user.nickname} profile is not public`);
            }
            if (!value.playerstats.hasOwnProperty("achievements")) {
                throw new Error(`${value.playerstats.gameName} doesn't have achievements`);
            }
            let nb_unlocked_user = 0;
            let nb_new_achievements = 0;
            this.nbTotal = value.playerstats.achievements.length;
            this.realName = value.playerstats.gameName;
            let achievements_need_icons = false;
            for (const a of value.playerstats.achievements) {
                if (a.unlocktime !== 0) {
                    nb_unlocked_user++;
                }
                if (!this.achievements[a.apiname]) {
                    this.achievements[a.apiname] = {
                        achievementName: a.name,
                        achievementDescription: a.description,
                        playersUnlockTime: {},
                        globalPercentage: undefined,
                        icon: undefined
                    };
                    achievements_need_icons = true;
                }
                this.achievements[a.apiname].playersUnlockTime[user.steam_id] = a.unlocktime;

                if (!start && a.unlocktime > last_scan) {
                    const lclId = `${this.id}_${a.apiname}`;
                    if (!user.displayedAchievements.includes(lclId)) {
                        user.newAchievements.push({ object: this.achievements[a.apiname], gameId: this.id, pos: nb_new_achievements });
                        user.displayedAchievements.push(lclId);
                        nb_new_achievements++;
                    }
                }
            }

            if (achievements_need_icons) {
                await this.getAchievementsIcon();
                await this.updateGlobalPercentage();
            }
            this.nbUnlocked[user.steam_id] = { nbUnlocked: nb_unlocked_user, user: user };

            if (!start) {
                console.log(`Found ${nb_new_achievements} new achievements for ${user.nickname} on ${this.name}`);
            }
        } catch (err) {
            if (!start) {
                console.error(`updateAchievements error for ${user.nickname} on ${this.name}:`, err);
            }
            return false;
        }
        return true;
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

    getCompareAchievements(userAuthor, users_vs) {
        var validAchievements = Object.entries(this.achievements).map(([a_id, a]) => {
            if (a.playersUnlockTime[userAuthor.steam_id] === 0) {
                const playersWhoUnlocked = Object.entries(a.playersUnlockTime).map(([u, unlocked_time]) => {
                    if (unlocked_time != 0 && users_vs.map(_u => _u.steam_id).includes(u)) {
                        return users_vs.find(_u => _u.steam_id === u)
                    }
                }).filter(notUndefined => notUndefined !== undefined);
                if (playersWhoUnlocked.length > 0) {
                    return { object: a, playersWhoUnlocked: playersWhoUnlocked }
                }
            }

        }).filter(notUndefined => notUndefined !== undefined);
        var vs1;
        if (users_vs.length === 1) {
            vs1 = users_vs[0]
        }
        return validAchievements
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

    getAchievementsHistory(guildId) {
        try {
            let timestamp_history = {} //Dict with list of timestamps of achievements unlock time for each player(key)
            let all_timestamps = []
            const guild_users = []

            let nbAchievementsList = {}
            Object.keys(this.nbUnlocked).forEach(userSteamID => {
                if (this.nbUnlocked[userSteamID].user.guilds.includes(guildId)) {
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

            for (const [userSteamID, userObject] of Object.entries(this.nbUnlocked)) {
                if (guild_users.includes(userSteamID)) {
                    datasets.push({
                        data: nbAchievementsList[userSteamID],
                        borderColor: userObject.user.color,
                        label: userObject.user.nickname
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