import { SlashCommandBuilder } from 'discord.js';
import { addGameDB } from '../../connectAndQueryJSON.js';
import { getOrAddGame } from '../../steam/appData.js';
import { isGameIdValid } from '../../steam/api.js';

export const data = new SlashCommandBuilder()
	.setName('add_game')
	.setDescription('Add a new game to the list')
	.addStringOption(option => option.setName('game_id')
		.setDescription('the steam game id')
		.setRequired(true))
	.addStringOption(option => option.setName('name')
		.setDescription('the name you want to set for this game (optional)')
		.setRequired(false));
export async function execute(interaction) {
	const game_id = parseInt(interaction.options.getString('game_id'));
	const game_name = interaction.options.getString('name');
	await interaction.deferReply();

	try {
		if (game_name) {
			const otherGameNameFound = Array.from(interaction.client.data.games.values()).find(game => (game.id !== game_id) && (game.name === game_name));
			console.log("otherGameNameFound:", otherGameNameFound);
			if (otherGameNameFound) {
				await interaction.editReply('Name already used by other game.');
				return;
			}
		}

		if (!(await isGameIdValid(game_id))) {
			await interaction.editReply('Invalid game ID.');
			return;
		}

		const gameObject = await getOrAddGame(
			interaction.client.data,
			game_id
		);

		if (!gameObject) {
			throw new Error();
		}

		const alreadyHadGameName = gameObject.name ? true : false;
		const gameAlreadyInGuild = gameObject.guilds.includes(interaction.guildId);
		gameObject.name = game_name ? game_name : `game_${gameObject.id}`;

		// Update existing game's guild
		if (!await addGameDB(interaction, gameObject)) throw new Error("Failed to add game to DB");
		// If the game is already in the guild's list, we don't need to add it again
		if (gameAlreadyInGuild) {
			await interaction.editReply(`Game ${gameObject.realName} (${gameObject.id}) is already added to this guild. ${alreadyHadGameName ? "Name was updated." : ""}`);
			return;
		}
		else {
			gameObject.guilds.push(interaction.guildId);
		}
		if (!await addGameDB(interaction, gameObject)) throw new Error("Failed to add game to DB");
		await interaction.editReply(`Game ${gameObject.realName} (${gameObject.id}) added/updated. ${alreadyHadGameName ? "Name was updated." : ""}`);

	} catch (error) {
		console.error("Error adding game:", error);
		await interaction.editReply("An unexpected error occurred while adding the game.");
	}
}