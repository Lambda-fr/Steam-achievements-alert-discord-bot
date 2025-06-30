import { SlashCommandBuilder } from 'discord.js';

function list_players(guildId, users) {

	var header = 'Players I listen to for new achievements\n'
	let data = users.filter(u => u.guilds.includes(guildId)).map(u => [u.nickname, u.discord_id, u.steam_id])
	data = [['Nickname', 'Discord ID', 'Steam ID'], ['', '', ''], ...data]
	let colWidths = data[0].map((_, colIndex) => {
		return Math.max(...data.map(row => row[colIndex].length));
	});

	let formattedLines = data.map(row => {
		return row.map((item, colIndex) => {
			return item.padEnd(colWidths[colIndex], ' ');
		}).join('    ');
	}).join('\n');

	return `${header}\`\`\`\n${formattedLines}\n\`\`\``
}

export const data = new SlashCommandBuilder()
	.setName('list_players')
	.setDescription('Lists the players the bot listens to for new achievements');
export async function execute(interaction) {
	await interaction.reply(list_players(interaction.guildId, interaction.client.data.users));
}