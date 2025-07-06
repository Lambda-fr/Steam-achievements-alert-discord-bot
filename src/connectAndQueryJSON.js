import { readFileSync, writeFileSync } from 'node:fs';
const data_path = 'src/data.json'
import User from './models/User.js';
import { getOrAddGame } from './steam/appData.js';
import { isGameIdValid } from './steam/api.js';

/**
 * Loads users and games from the JSON DB, and attaches channel info to guilds.
 * Returns [users, games].
 */
async function getInfosDB(guilds, client) {
    var users = [];
    let data;
    try {
        const jsonData = readFileSync(data_path);
        data = JSON.parse(jsonData);
    } catch (err) {
        console.error("Error while reading or parsing data.json:", err.message);
        return [[], []];
    }
    try {
        Object.entries(data.users).forEach(([DiscordID, user]) => {
            users.push(new User(user.SteamID, DiscordID, user.DiscordNickname, user.Guilds, user.Color))
        })
        /*Object.entries(data.games).forEach(([AppID, game]) => {
            games.push(new Game(game.Name, AppID, game.Guilds, game.Aliases || []))
        })*/
        guilds.forEach((guild) => {
            // Not clean: mutates input objects, should return new objects instead
            if (Object.keys(data.guilds).includes(guild.id)) {
                guild.channel_id = data.guilds[guild.id].channelId
                guild.display_all_achievements = data.guilds[guild.id].displayAllAchievements || false;
                try {
                    guild.channel = client.guilds.cache.get(guild.id)?.channels.cache.find(c => c.id === guild.channel_id)
                } catch (err) {
                    console.error(`Error finding channel for guild ${guild.id}:`, err.message);
                    guild.channel = null;
                }
            }
        })
    } catch (err) {
        console.error("Error while processing data.json:", err.message);
    }
    return users
}

async function getGamesDB(client) {
    try {
        const jsonData = readFileSync(data_path);
        const data = JSON.parse(jsonData);
        if (!data.games) {
            console.error("No games found in data.json");
            return; // No games to process
        }

        for (const [AppID, gameData] of Object.entries(data.games)) {
            try {
                // Check if the game ID is valid
                if (!(await isGameIdValid(parseInt(AppID)))) {
                    throw new Error("Invalid game ID.");
                }
                let game = await getOrAddGame(
                    client.data,
                    parseInt(AppID)
                );
                if (game) {
                    game.guilds = gameData.Guilds || [];
                    game.name = gameData.Name || '';
                    game.aliases = gameData.Aliases || [];
                }
            } catch (error) {
                console.warn(`Failed to add/update game ${AppID} from data.json: ${error.message}`);
            }
        }
    } catch (err) {
        console.error("Error while reading or parsing data.json in getGamesDB:", err.message);
    }
}

/**
 * Adds a game to the DB.
 */
async function addGameDB(interaction, gameObject) {
    try {
        const jsonData = readFileSync(data_path);
        const data = JSON.parse(jsonData);

        data.games[gameObject.id] = {
            "Name": gameObject.name,
            "Guilds": gameObject.guilds,
            "Aliases": gameObject.aliases,
            "RealName": gameObject.realName
        }
        writeFileSync(data_path, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error("addGameDB error:", error.message);
        return false;
    }
}

/**
 * Adds or updates a user in the DB.
 */
async function addUserDB(DiscordID, SteamID, DiscordNickname, interaction, color) {
    try {
        const jsonData = readFileSync(data_path);
        const data = JSON.parse(jsonData);
        let guilds = []
        if (Object.keys(data.users).includes(DiscordID)) {
            guilds = data.users[DiscordID].Guilds
        }
        guilds.push(interaction.guildId)
        data.users[DiscordID] = {
            "SteamID": SteamID,
            "DiscordNickname": DiscordNickname,
            "Guilds": guilds,
            "Color": color
        }
        writeFileSync(data_path, JSON.stringify(data));
        await interaction.reply('User added');
    } catch (error) {
        console.error("addUserDB error:", error.message);
        try {
            await interaction.reply('Error');
        } catch (e) {
            console.error("Interaction reply failed:", e.message);
        }
    }
}

/**
 * Removes a game from the DB, or just from a guild if shared.
 */
async function removeGameDB(gameID, guildId, nbGuildsGame, interaction) {
    try {
        const jsonData = readFileSync(data_path);
        const data = JSON.parse(jsonData);
        if (nbGuildsGame === 1) {
            delete data.games[gameID]
        }
        else {
            // Not clean: does not check if Guilds exists or is an array
            data.games[gameID].Guilds = data.games[gameID].Guilds.filter(function (guild) { return guild != guildId })
        }
        writeFileSync(data_path, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error("removeGameDB error:", error.message);
        return false;
    }
}


/**
 * Removes a user from the DB, or just from a guild if shared.
 */
async function removePlayerDB(userDiscordId, guildId, nbGuildsUser, interaction) {
    try {
        const jsonData = readFileSync(data_path);
        const data = JSON.parse(jsonData);
        if (nbGuildsUser === 1) {
            delete data.users[userDiscordId]
        }
        else {
            data.users[userDiscordId].Guilds = data.users[userDiscordId].Guilds.filter(function (guild) { return guild != guildId })
        }
        writeFileSync(data_path, JSON.stringify(data));
        await interaction.reply('User removed');
    } catch (error) {
        console.error("removePlayerDB error:", error.message);
        try {
            await interaction.reply('Error');
        } catch (e) {
            console.error("Interaction reply failed:", e.message);
        }
    }
}

/**
 * Changes a user's color in the DB.
 */
async function changeColorDB(userDiscordId, color) {
    try {
        const jsonData = readFileSync(data_path);
        const data = JSON.parse(jsonData);
        if (!data.users[userDiscordId]) {
            console.error(`User ${userDiscordId} not found in DB`);
            return;
        }
        data.users[userDiscordId].Color = color
        writeFileSync(data_path, JSON.stringify(data));
    } catch (error) {
        console.error("changeColorDB error:", error.message);
    }
}

/**
 * Changes or sets the channel ID and display settings for a guild in the DB.
 */
async function setGuildChannelAndDisplaySettingsDB(guildId, channelId, displayAllAchievements) {
    try {
        const jsonData = readFileSync(data_path);
        const data = JSON.parse(jsonData);
        if (Object.keys(data.guilds).includes(guildId)) {
            data.guilds[guildId].channelId = channelId
            data.guilds[guildId].displayAllAchievements = displayAllAchievements
        }
        else {
            data.guilds[guildId] = {
                "channelId": channelId,
                "displayAllAchievements": displayAllAchievements
            }
        }
        writeFileSync(data_path, JSON.stringify(data));
    }
    catch (error) {
        console.error("setGuildChannelAndDisplaySettingsDB error:", error.message);
    }
}

export { addGameDB, addUserDB, removeGameDB, removePlayerDB, changeColorDB, setGuildChannelAndDisplaySettingsDB, getInfosDB, getGamesDB };