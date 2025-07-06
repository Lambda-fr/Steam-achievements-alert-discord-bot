import { SlashCommandBuilder } from 'discord.js';
import discordImageFunctions from '../../discord/image_generation.cjs'

export const data = new SlashCommandBuilder()
	.setName('progress')
	.setDescription('Displays the progression bar for a game')
	.addStringOption(option => option.setName('game_name')
		.setDescription('name of the game as you specified it (do /list_games)')
		.setRequired(true));
export async function execute(interaction) {
	// Defer the reply to allow time for processing             
	await interaction.deferReply();
	const game_name = interaction.options.getString('game_name');
	const gameObject = Array.from(interaction.client.data.games.values()).find(game => game.name === game_name || game.aliases.includes(game_name));
	if (typeof gameObject === 'undefined') {
		await interaction.reply('Game not found!');
		return;
	}
	if (!gameObject.guilds.includes(interaction.guildId)) {
		await interaction.reply('Game not in the guild list!');
		return;
	}
	discordImageFunctions.displayProgressionBar(interaction, gameObject);
}