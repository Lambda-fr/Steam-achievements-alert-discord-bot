import { SlashCommandBuilder } from 'discord.js';
import { removeGameDB } from '../../connectAndQueryJSON.js';

export const data = new SlashCommandBuilder()
	.setName('remove_game')
	.setDescription('Remove a game from the list')
	.addStringOption(option => option.setName('game_name')
		.setDescription('Name of the game as you specified it (do /list_games)')
		.setRequired(true));
export async function execute(interaction) {
	const game_name = interaction.options.getString('game_name');
	var find = false;
	for (let game of interaction.client.data.games.values()) {
		if (game.name === game_name || game.aliases.includes(game_name)) {
			find = true;
			try {
				console.log(`guildId : ${interaction.guildId} ; list : ${game.guilds}`);
				if (!game.guilds.includes(interaction.guildId)) {
					await interaction.reply('Game not in the games list for this guild!');
					return;
				} else {
					const indexGuild = game.guilds.indexOf(interaction.guildId);
					game.guilds.splice(indexGuild, 1);
					console.log(`${interaction.guildId} removed from ${game.name}'s guilds list`);
				}
				removeGameDB(game.id, interaction.guildId, game.guilds.length, interaction);
				await interaction.reply('Game removed');
				return;
			}
			catch (error) {
				console.error("Error while removing game:", error.message);
				await interaction.reply('Error while removing game');
			}
		}
	}
	if (!find) {
		await interaction.reply('Game not in the games list!');
		return;
	}
}