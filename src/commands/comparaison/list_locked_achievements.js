import { SlashCommandBuilder } from 'discord.js';
import discordImageFunctions from '../../discord/image_generation.cjs'
import { createGameAutocomplete } from '../../utils/autocomplete_games.js';
export const autocomplete = createGameAutocomplete();

export const data = new SlashCommandBuilder()
	.setName('list_locked_achievements')
	.setDescription('Lists achievements locked for you')
	.addIntegerOption(option => option.setName('game_name')
		.setDescription('name of the game')
		.setRequired(true)
		.setAutocomplete(true))
	.addUserOption(option => option.setName('player_mention1')
		.setDescription('mention a player if you want to includes its locked achievements')
		.setRequired(false))
	.addUserOption(option => option.setName('player_mention2')
		.setDescription('mention a player if you want to includes its locked achievements')
		.setRequired(false))
	.addUserOption(option => option.setName('player_mention3')
		.setDescription('mention a player if you want to includes its locked achievements')
		.setRequired(false));
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
	const userAuthor = interaction.client.data.users.find(user => user.discord_id === interaction.user.id);
	if (typeof userAuthor === 'undefined') {
		await interaction.editReply("You are not in players list. Use */addplayer* command");
		return;
	}

	var other_users = [];

	for (const player_mention of ['player_mention1', 'player_mention2', 'player_mention3']) {
		const mention = interaction.options.getUser(player_mention);
		if (mention != null) {
			if (mention.id === interaction.user.id) {
				break;
			}
			const user = interaction.client.data.users.find(user => user.discord_id === mention.id && user.guilds.includes(interaction.guildId));
			if (typeof user === 'undefined') {
				break;
			}
			other_users.push(user);

		}
	}

	await gameObject.updateGlobalPercentage();
	let validAchievements = gameObject.getLockedAchievements(userAuthor, interaction.guildId, interaction.client.data.users, other_users);
	const canvas_title = `Locked for ${userAuthor.nickname} ${other_users.length > 0 ? `or ${other_users.map(user => user.nickname)}` : ``}`
	const canvas_title2 = `locked`
	discordImageFunctions.displayAchievementsList(validAchievements, interaction, [canvas_title, canvas_title2])
}