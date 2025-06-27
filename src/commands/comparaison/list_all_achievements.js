import { SlashCommandBuilder } from 'discord.js';
import discordImageFunctions from '../../discord_loadimages.cjs'

export const data = new SlashCommandBuilder()
	.setName('list_all_achievements')
	.setDescription('Lists all achievements')
	.addStringOption(option => option.setName('game_name')
		.setDescription('name of the game as you specified it (do /list_games)')
		.setRequired(true));
export async function execute(interaction, globalVariables) {
	const game_name = interaction.options.getString('game_name');
	const gameObject = globalVariables.Games.find(game => game.name === game_name || game.aliases.includes(game_name));
	if (typeof gameObject === 'undefined') {
		await interaction.reply('Game not found!');
		return;
	}
	if (!gameObject.guilds.includes(interaction.guildId)) {
		await interaction.reply('Game not in the guild list!');
		return;
	}

	await gameObject.updateGlobalPercentage();
	discordImageFunctions.displayProgressionBar(interaction, gameObject);
	let validAchievements = gameObject.getAllAchievements(interaction, globalVariables);
	const canvas_title = `All achievements`
	const canvas_title2 = `all`
	discordImageFunctions.displayAchievementsList(validAchievements, interaction, [canvas_title, canvas_title2])
}