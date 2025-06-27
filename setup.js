import { REST, Routes } from 'discord.js';
import { accessSync, constants, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'url';

function checkIfFileExists(filePath) {
	try {
		accessSync(filePath, constants.F_OK);
		return true;
	} catch (err) {
		return false;
	}
}

function createJsonFile(filePath, data) {
	writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function exitWithError(message, error = null) {
	console.error(`[ERROR] ${message}`);
	if (error) console.error(error);
	process.exit(1);
}

const defaultData = {
	users: {},
	games: {},
	guilds: {}
}

const defaultConfig = {
	API_Steam_key: "",
	clientId: "",
	guildId: "",
	discord_token: "",
	lang: "english"
}

let filePath = 'src/data.json';
if (!checkIfFileExists(filePath)) {
	createJsonFile(filePath, defaultData);
	console.log(`${filePath} file created`);
} else {
	console.log(`${filePath} already existing`);
}

filePath = 'config.json';
if (!checkIfFileExists(filePath)) {
	createJsonFile(filePath, defaultConfig);
	console.log(`${filePath} file created, please fill it`);
	process.exit(1);
} else {
	console.log(`${filePath} already existing`);
}

import config from './config.json' with { type: 'json' };

const { clientId, guildId, discord_token } = config;
if (clientId === "" || guildId === "" || discord_token === "") {
	exitWithError('Please fill ./config.json');
}


const commands = [];
const foldersPath = join(process.cwd(), 'src/commands');
if (!existsSync(foldersPath)) {
	exitWithError(`Commands folder not found at ${foldersPath}`);
}

let totalCommands = 0;
let failedCommands = 0;

const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = join(foldersPath, folder);
	if (!existsSync(commandsPath)) {
		console.warn(`[WARNING] Command subfolder not found: ${commandsPath}`);
		continue;
	}
	const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = join(commandsPath, file);
		try {
			const command = await import(pathToFileURL(filePath));
			if ('data' in command && 'execute' in command) {
				commands.push(command.data.toJSON());
				totalCommands++;
			} else {
				console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
				failedCommands++;
			}
		} catch (err) {
			console.warn(`[WARNING] Failed to import command at ${filePath}:`, err.message);
			failedCommands++;
		}
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(discord_token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);
		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);
		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
		console.log(`Commands loaded: ${totalCommands}, failed: ${failedCommands}`);
	} catch (error) {
		exitWithError('Failed to deploy commands', error);
	}
})();