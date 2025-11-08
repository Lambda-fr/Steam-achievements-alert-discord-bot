import { SlashCommandBuilder } from 'discord.js';
import discordImageFunctions from '../../discord/image_generation.cjs'
import { createGameAutocomplete } from '../../utils/autocomplete_games.js';
export const autocomplete = createGameAutocomplete();

export const data = new SlashCommandBuilder()
	.setName('list_all_achievements')
	.setDescription('Lists all achievements')
	.addIntegerOption(option => option.setName('game_name')
		.setDescription('name of the game')
		.setRequired(true)
		.setAutocomplete(true))
export async function execute(interaction) {
	// Defer the reply to allow time for processing             
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

	await gameObject.updateGlobalPercentage();

	let validAchievements = gameObject.getAllAchievements(interaction.guildId, interaction.client.data.users);
	const canvas_title = `All achievements`
	const canvas_title2 = `all`
	discordImageFunctions.displayAchievementsList(validAchievements, interaction, [canvas_title, canvas_title2])
}