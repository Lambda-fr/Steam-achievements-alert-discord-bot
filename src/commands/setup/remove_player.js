import { SlashCommandBuilder } from 'discord.js';
import { removePlayerDB } from '../../connectAndQueryJSON.js';

export const data = new SlashCommandBuilder()
	.setName('remove_player')
	.setDescription('Remove a player from the list of players listened to for new achievements')
	.addUserOption(option => option.setName('player_mention')
		.setDescription('player mention')
		.setRequired(true));
export async function execute(interaction, globalVariables) {
	const discord_id = interaction.options.getUser('player_mention').id;
	var find = false;
	for (let user of globalVariables.Users) {
		if (user.discord_id === discord_id) {
			find = true;
			if (!user.guilds.includes(interaction.guildId)) {
				await interaction.reply('Player not in the players list for this guild!');
				return;
			}
			removePlayerDB(discord_id, interaction.guildId, user.guilds.length, interaction);
			if (user.guilds.length === 1) {
				for (const game of globalVariables.Games) {
					for (const achievementID of Object.keys(game.achievements)) {
						if (typeof game.achievements[achievementID][user.steam_id] != 'undefined') {
							delete game.achievements[achievementID][user.steam_id];
						}
					}
					if (typeof game.nbUnlocked[user.steam_id] != 'undefined') {
						delete game.nbUnlocked[user.steam_id];
					}

				}
				const indexUser = globalVariables.Users.indexOf(user);
				globalVariables.Users.splice(indexUser, 1);
				console.log(`${user.nickname} erased from DB`);
			}
			else {
				const indexGuild = user.guilds.indexOf(interaction.guildId);
				user.guilds.splice(indexGuild, 1);
				console.log(`${interaction.guildId} removed from ${user.nickname}'s guilds list`);
			}
			return;
		}
	}
	if (!find) {
		await interaction.reply('Player not in the players list!');
		return;
	}
}