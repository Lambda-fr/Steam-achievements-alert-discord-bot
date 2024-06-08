const { SlashCommandBuilder } = require('discord.js');
const { addGameDB } = require('../../connectAndQueryJSON')
const { Game } = require('../../models/Game.js')
const { isGameIdValid } = require('../../steam_interface')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add_game')
		.setDescription('Add a new game to the list')
		.addStringOption(option =>
			option.setName('game_id')
				.setDescription('the steam game id')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('name')
				.setDescription('the name you want to set for this game. You can set aliases (separate by ",")')
				.setRequired(true)),
	async execute(interaction, globalVariables) {
		const game_id = interaction.options.getString('game_id')
		const nameOption = interaction.options.getString('name');
		const [game_name, ...aliases] = nameOption.split(',').map(s => s.trim());
		await interaction.deferReply()
		const [game_id_valid, realName] = await isGameIdValid(game_id)
		if (game_id_valid == 1) {
			const gameIdFound = globalVariables.Games.find(game => (game.id === game_id))
			const otherGameNameFound = globalVariables.Games.find(game => (game.id !== game_id) && (game.name === game_name || game.aliases.includes(game_name) || aliases.some(alias => game.aliases.includes(alias) || (game.name == alias))))
			if (otherGameNameFound) {
				await interaction.editReply('Alias/Name already used by other game.');
				return
			}

			if (gameIdFound) {
				const guildIsIncluded = gameIdFound.guilds.includes(interaction.guildId)
				const aliasesToAdd = [...new Set([game_name, ...aliases].filter(alias => (![gameIdFound.name, ...gameIdFound.aliases].includes(alias)) && alias.trim() !== ''))]
				if (!aliasesToAdd.length) {
					if (guildIsIncluded) {
						await interaction.editReply('Game already in the list.');
						return
					}
				}
				else {
					gameIdFound.aliases = [...gameIdFound.aliases, ...aliasesToAdd]
				}
				if (!guildIsIncluded)
					gameIdFound.guilds.push(interaction.guildId)

			}
			else {
				globalVariables.Games.push(new Game(game_name, game_id, [interaction.guildId], aliases, realName));
			}
			let gameObject = globalVariables.Games.find(game => game.id === game_id);

			addGameDB(interaction, gameObject);

			globalVariables.Users.map(async user => {
				await user.getPlaytime(globalVariables.Games);
				await gameObject.updateAchievements(user, globalVariables.t_lookback);
			});
			return;
		}
		if (game_id_valid == 0) {
			await interaction.editReply("This game has no achievements. Not added.")
			return
		}
		await interaction.editReply("Invalid game ID.")
	}
}