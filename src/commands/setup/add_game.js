import { SlashCommandBuilder } from 'discord.js';
import { addGameDB } from '../../connectAndQueryJSON.js';
import { getOrAddGame } from '../../steam/appData.js';

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
	const game_id = parseInt(interaction.options.getString('game_id'));
	const nameOption = interaction.options.getString('name');
	const [game_name, ...aliases] = nameOption.split(',').map(s => s.trim());
	await interaction.deferReply();

	try {
		const otherGameNameFound = Array.from(interaction.client.data.games.values()).find(game => (game.id !== game_id) && (game.name === game_name || game.aliases.includes(game_name) || aliases.some(alias => game.aliases.includes(alias) || (game.name == alias))));
		if (otherGameNameFound) {
			await interaction.editReply('Alias/Name already used by other game.');
			return;
		}

		const gameObject = await getOrAddGame(
			interaction.client.data,
			game_id
		);

		if (!gameObject) {
			await interaction.editReply('Game not found or not valid.');
			return;
		}

		// Update existing game's guilds and aliases
		if (gameObject.guilds.includes(interaction.guildId)) {
			// If the game is already in the guild's list, we don't need to add it again
			await interaction.editReply(`Game ${gameObject.name} (${gameObject.id}) is already added to this guild.`);
			return;
		}
		gameObject.guilds.push(interaction.guildId);

		// If the game already has a name, we don't overwrite it
		if (!gameObject.name) {
			gameObject.name = game_name;
		}
		// Else if the game already has a name, we add the new name as an alias
		else if (!gameObject.aliases.includes(game_name)) {
			gameObject.aliases.push(game_name);
		}
		// Add aliases if they are not already present
		aliases.forEach(alias => {
			if (!gameObject.aliases.includes(alias)) {
				gameObject.aliases.push(alias);
			}
		});

		if (!await addGameDB(interaction, gameObject)) throw new Error("Failed to add game to DB");

		await interaction.editReply(`Game ${gameObject.name} (${gameObject.id}) added/updated.`);

	} catch (error) {
		console.error("Error adding game:", error);
		await interaction.editReply("An unexpected error occurred while adding the game.");
	}
}