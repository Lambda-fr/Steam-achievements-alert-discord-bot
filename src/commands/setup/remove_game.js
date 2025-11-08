import { SlashCommandBuilder } from 'discord.js';
import { removeGameDB } from '../../connectAndQueryJSON.js';
import { createGameAutocomplete } from '../../utils/autocomplete_games.js';
export const autocomplete = createGameAutocomplete();

export const data = new SlashCommandBuilder()
	.setName('remove_game')
	.setDescription('Remove a game from the list')
	.addIntegerOption(option => option.setName('game_name')
		.setDescription('name of the game')
		.setRequired(true)
		.setAutocomplete(true))
export async function execute(interaction) {
	const game_id = interaction.options.getInteger('game_name');
	const gameObject = Array.from(interaction.client.data.games.values()).find(game => game.id === game_id);
	if (!gameObject) {
		await interaction.reply('Game not found!');
		return;
	}
	if (!gameObject.guilds.includes(interaction.guildId)) {
		await interaction.reply('Game not in the games list for this guild!');
		return;
	} else {
		const indexGuild = gameObject.guilds.indexOf(interaction.guildId);
		gameObject.guilds.splice(indexGuild, 1);
		console.log(`${interaction.guildId} removed from ${gameObject.name}'s guilds list`);
	}
	removeGameDB(gameObject.id, interaction.guildId, gameObject.guilds.length, interaction);
	await interaction.reply('Game removed');
	return;
}