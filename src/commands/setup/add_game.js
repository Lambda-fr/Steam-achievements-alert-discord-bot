import { SlashCommandBuilder } from 'discord.js';
import { addGameDB } from '../../connectAndQueryJSON.js';
import Game from '../../models/Game.js';
import { isGameIdValid } from '../../steam/api.js';

export const data = new SlashCommandBuilder()
	.setName('add_game')
	.setDescription('Add a new game to the list')
	.addStringOption(option => option.setName('game_id')
		.setDescription('the steam game id')
		.setRequired(true))
	.addStringOption(option => option.setName('name')
		.setDescription('the name you want to set for this game. You can set aliases (separate by ",")')
		.setRequired(true));
export async function execute(interaction) {
	const game_id = interaction.options.getString('game_id');
	const nameOption = interaction.options.getString('name');
	const [game_name, ...aliases] = nameOption.split(',').map(s => s.trim());
	await interaction.deferReply();
	const game_id_valid = await isGameIdValid(game_id);
	if (game_id_valid == 1) {
		const gameIdFound = interaction.client.data.games.find(game => (game.id === game_id));
		const otherGameNameFound = interaction.client.data.games.find(game => (game.id !== game_id) && (game.name === game_name || game.aliases.includes(game_name) || aliases.some(alias => game.aliases.includes(alias) || (game.name == alias))));
		if (otherGameNameFound) {
			await interaction.editReply('Alias/Name already used by other game.');
			return;
		}

		if (gameIdFound) {
			const guildIsIncluded = gameIdFound.guilds.includes(interaction.guildId);
			const aliasesToAdd = [...new Set([game_name, ...aliases].filter(alias => (![gameIdFound.name, ...gameIdFound.aliases].includes(alias)) && alias.trim() !== ''))];
			if (!aliasesToAdd.length) {
				if (guildIsIncluded) {
					await interaction.editReply('Game already in the list.');
					return;
				}
			}
			else {
				gameIdFound.aliases = [...gameIdFound.aliases, ...aliasesToAdd];
			}
			if (!guildIsIncluded)
				gameIdFound.guilds.push(interaction.guildId);

		}
		else {
			interaction.client.data.games.push(new Game(game_name, game_id, [interaction.guildId], aliases));
		}
		let gameObject = interaction.client.data.games.find(game => game.id === game_id);

		addGameDB(interaction, gameObject);

		interaction.client.data.users.map(async (user) => {
			await user.updateOwnedGamesData();
			await gameObject.updateAchievementsForUser(user, interaction.client.data.t_lookback);
		});
		if (gameObject.realName === '') {
			gameObject.getRealName();
		}
		return;
	}
	if (game_id_valid == 0) {
		await interaction.editReply("This game has no achievements. Not added.");
		return;
	}
	await interaction.editReply("Invalid game ID.");
}