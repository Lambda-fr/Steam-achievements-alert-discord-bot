import { SlashCommandBuilder } from 'discord.js';
import discordImageFunctions from '../../discord/image_generation.cjs'

export const data = new SlashCommandBuilder()
	.setName('list_compare_achievements')
	.setDescription('Lists achievements locked for you that are unlocked for other players')
	.addStringOption(option => option.setName('game_name')
		.setDescription('name of the game as you specified it (do /list_games)')
		.setRequired(true))
	.addUserOption(option => option.setName('player_mention')
		.setDescription('mention a player if you want to show only its achievements')
		.setRequired(false));
export async function execute(interaction) {
	// Defer the reply to allow time for processing             
	await interaction.deferReply();
	const user_vs = interaction.options.getUser('player_mention');
	const game_name = interaction.options.getString('game_name');
	const gameObject = Array.from(interaction.client.data.games.values()).find(game => game.name === game_name || game.aliases.includes(game_name));
	if (typeof gameObject === 'undefined') {
		await interaction.editReply('Game not found!');
		return;
	}
	if (!gameObject.guilds.includes(interaction.guildId)) {
		await interaction.editReply('Game not in the guild list!');
		return;
	}
	const userAuthor = interaction.client.data.users.find(user => user.discord_id === interaction.user.id);
	if (typeof userAuthor === 'undefined') {
		await interaction.editReply("You are not in players list. Use */addplayer* command");
		return;
	}
	var users_vs;
	if (user_vs != null) {
		if (user_vs.id === interaction.user.id) {
			await interaction.editReply("You can't compare against yourself!");
			return;
		}
		const userVsObject = interaction.client.data.users.find(user => user.discord_id === user_vs.id && user.guilds.includes(interaction.guildId));
		if (typeof userVsObject === 'undefined') {
			await interaction.editReply('User vs. not in the guild list!');
			return;
		}
		else {
			users_vs = [userVsObject];
		}
	}
	else {
		users_vs = interaction.client.data.users.filter(user => {

			if (user.guilds.includes(interaction.guildId) && user.discord_id != interaction.user.id) {
				return true;
			}
			return false;
		});

	}

	await gameObject.updateGlobalPercentage();
	let validAchievements = gameObject.getCompareAchievements(userAuthor, users_vs, interaction);
	const canvas_title = `Locked achievements for ${userAuthor.nickname} vs. ${typeof vs1 === 'undefined' ? 'all' : vs1.nickname}`
	const canvas_title2 = `locked`
	discordImageFunctions.displayAchievementsList(validAchievements, interaction, [canvas_title, canvas_title2])
}