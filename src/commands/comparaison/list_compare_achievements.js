import { SlashCommandBuilder } from 'discord.js';
import discordImageFunctions from '../../discord/image_generation.cjs'

export const data = new SlashCommandBuilder()
	.setName('list_compare_achievements')
	.setDescription('Lists achievements locked for you that are unlocked for other players')
	.addStringOption(option => option.setName('game_name')
		.setDescription('name of the game as you specified it (do /list_games)')
		.setRequired(true))
	.addUserOption(option => option.setName('player_mention')
		.setDescription('mention a player if you want to compare only with him')
		.setRequired(false));
export async function execute(interaction) {
	await interaction.deferReply();

	const game_name = interaction.options.getString('game_name');
	const playerMention = interaction.options.getUser('player_mention');
	const gameObject = Array.from(interaction.client.data.games.values())
		.find(game => game.name === game_name || game.aliases.includes(game_name));

	if (!gameObject)
		return interaction.editReply('Game not found!');
	if (!gameObject.guilds.includes(interaction.guildId))
		return interaction.editReply('Game not in the guild list!');

	const userAuthor = interaction.client.data.users.find(u => u.discord_id === interaction.user.id);
	if (!userAuthor)
		return interaction.editReply("You are not in players list. Use */addplayer* command");

	let vsUser = null;
	if (playerMention) {
		if (playerMention.id === interaction.user.id)
			return interaction.editReply("You can't compare against yourself!");
		vsUser = interaction.client.data.users.find(u =>
			u.discord_id === playerMention.id && u.guilds.includes(interaction.guildId)
		);
		if (!vsUser)
			return interaction.editReply('User vs. not in the guild list!');
	}

	const guildUsers = interaction.client.data.users.filter(u =>
		u.guilds.includes(interaction.guildId) && u.discord_id !== interaction.user.id
	);

	await gameObject.updateGlobalPercentage();
	const validAchievements = gameObject.getCompareAchievements(userAuthor, guildUsers, vsUser);
	const canvas_title = `Locked achievements for ${userAuthor.nickname} vs. ${vsUser ? vsUser.nickname : 'all'}`;
	const canvas_title2 = `locked`;
	console.log(validAchievements);
	discordImageFunctions.displayAchievementsList(validAchievements, interaction, [canvas_title, canvas_title2]);
}