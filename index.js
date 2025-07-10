// Require the necessary discord.js classes
import { pathToFileURL } from 'node:url';
import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import config from './config.json' with { type: 'json' };

import { getInfosDB, getGamesDB } from './src/connectAndQueryJSON.js';
import { loadAvatars } from './src/steam/api.js';
import { listenForNewAchievements } from './src/steam/achievement_listener.js';
import { startReportScheduler } from './src/discord/report_listener.js';
import Guild from './src/models/Guild.js';

// Add a timestamp to console logs
function withDateLog(originalFn) {
	return function (...args) {
		const now = new Date().toISOString();
		originalFn(`[${now}]`, ...args);
	};
}
console.log = withDateLog(console.log);
console.warn = withDateLog(console.warn);
console.error = withDateLog(console.error);


const { discord_token } = config;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a new client instance
const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildMembers]
});

// Parse command-line arguments
const args = process.argv.slice(2);
let t_lookback = parseInt((Date.now() - 3600000) / 1000); // Default value: 1 hour in the past

// Check if an arg is given for t_lookback
if (args.length > 0) {
	const customLookback = parseInt(args[0]);
	if (!isNaN(customLookback)) {
		t_lookback = customLookback;
	} else {
		console.warn("Wrong arg for t_lookback. Using default value (timestamp = 1 hour in the past).");
	}
}

// Attach a data object to the client to hold application state
client.data = {
	guilds: [],
	users: [],
	games: new Map(),
	tLookback: t_lookback
};


client.once(Events.ClientReady, async c => {
	try {
		console.log(`Ready! Logged in as ${c.user.tag}`);

		// 1. Initialisation de base
		client.data.guilds = client.guilds.cache.map(guild => new Guild(guild.id));
		client.data.users = await getInfosDB(client.data.guilds, client);
		await loadAvatars(client.data.users);

		// 2. Récupération des jeux de la BDD
		await getGamesDB(client);

		console.table(Array.from(client.data.games.values()), ['id', 'realName', 'name', 'aliases', 'playtime']);

		// 3. Enrichir les jeux avec les données des owned games des utilisateurs
		for (const user of client.data.users) {
			await user.updateOwnedGamesData(client.data);
		}

		// Affichage des tables et démarrage du listener
		console.table(client.data.users);
		console.log(`Current number of games in client.data.games: ${client.data.games.size}`);
		console.table(Array.from(client.data.games.values()), ['id', 'realName', 'name', 'aliases', 'playtime']);
		console.table(client.data.guilds);

		listenForNewAchievements(client.data);
		startReportScheduler(client);

	} catch (err) {
		console.error("Fatal error during bot initialization:", err);
		process.exit(1);
	}
});

// Log in to Discord with client's token
client.login(discord_token).catch(err => {
	console.error("Failed to login to Discord:", err);
	process.exit(1);
});

client.commands = new Collection();
const foldersPath = join(__dirname, 'src/commands');
const commandFolders = readdirSync(foldersPath);

async function loadCommands() {
	try {
		for (const folder of commandFolders) {
			const commandsPath = join(foldersPath, folder);
			const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

			for (const file of commandFiles) {
				const filePath = join(commandsPath, file);
				const fileUrl = pathToFileURL(filePath).href;
				let command;
				try {
					command = await import(fileUrl);
				} catch (err) {
					console.error(`Failed to import command at ${filePath}:`, err);
					continue;
				}

				if ('data' in command && 'execute' in command) {
					client.commands.set(command.data.name, command);
				} else {
					console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
				}
			}
		}
	} catch (err) {
		console.error("Error loading commands:", err);
		process.exit(1);
	}
}

loadCommands().catch(err => {
	console.error("Unhandled error during command loading:", err);
	process.exit(1);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		console.log(`Commande executée : ${interaction.commandName}`)
		await command.execute(interaction);
	} catch (error) {
		console.error(`Error executing command ${interaction.commandName}:`, error);
		try {
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		} catch (replyError) {
			console.error("Failed to send error reply to interaction:", replyError);
		}
	}
});

process.on('unhandledRejection', (reason, promise) => {
	console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', err => {
	console.error('Uncaught Exception thrown:', err);
	process.exit(1);
});
