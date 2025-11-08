import { SlashCommandBuilder } from 'discord.js';
import discordImageFunctions from '../../discord/image_generation.cjs'
import { createGameAutocomplete } from '../../utils/autocomplete_games.js';
export const autocomplete = createGameAutocomplete();

export const data = new SlashCommandBuilder()
	.setName('progress')
	.setDescription('Displays the progression bar for a game')
	.addIntegerOption(option => option.setName('game_name')
		.setDescription('name of the game')
		.setRequired(true)
		.setAutocomplete(true))

export async function execute(interaction) {
	await interaction.deferReply();
	const game_id = interaction.options.getInteger('game_name');
	const gameObject = Array.from(interaction.client.data.games.values()).find(game => game.id === game_id);
	if (typeof gameObject === 'undefined') {
		await interaction.editReply('Game not found!');
		return;
	}
	if (!gameObject.guilds.includes(interaction.guildId)) {
		await interaction.editReply('Game not in the guild list!');
		return;
	}
	discordImageFunctions.displayProgressionBar(interaction, gameObject);
}