const { SlashCommandBuilder } = require('discord.js');
const { removeGameDB } = require('../../connectAndQueryJSON')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove_game')
		.setDescription('Remove a game from the list')
		.addStringOption(option =>
			option.setName('game_name')
				.setDescription('Name of the game as you specified it (do /list_games)')
				.setRequired(true)),
	async execute(interaction, globalVariables) {
		const game_name = interaction.options.getString('game_name')
		var find = false
		for (game of globalVariables.Games) {
			if (game.name === game_name) {
				find = true
				console.log(`guildId : ${interaction.guildId} ; list : ${game.guilds}`)
				if (!game.guilds.includes(interaction.guildId)) {
					await interaction.reply('Game not in the games list for this guild!');
					return
				}
				if (game.guilds.length === 1) {
					const indexGame = globalVariables.Games.indexOf(game);
					globalVariables.Games.splice(indexGame, 1)
					console.log(`${game.name} erased from DB`)
				}
				else {
					const indexGuild = game.guilds.indexOf(interaction.guildId);
					game.guilds.splice(indexGuild, 1)
					console.log(`${interaction.guildId} removed from ${game.name}'s guilds list`)
				}
				removeGameDB(game.id, interaction.guildId, game.guilds.length, interaction)
				return
			}
		}
		if (!find) {
			await interaction.reply('Game not in the games list!');
			return
		}
	},
};