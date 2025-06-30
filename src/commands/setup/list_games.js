import { SlashCommandBuilder } from 'discord.js';

function list_games(guildId, games) {
	let games_alpha = [...games].sort((a, b) => a.realName.localeCompare(b.realName));
	let data = games_alpha.filter(g => g.guilds.includes(guildId)).map(g => [g.realName, g.id, ((([g.name, ...g.aliases]).join(',')).length > 90) ? ((([g.name, ...g.aliases]).join(',')).slice(0, 85)) : (([g.name, ...g.aliases]).join(','))])
	data = [['Name', 'Steam ID', 'Reference & Aliases'], ['', '', ''], ...data]
	let colWidths = data[0].map((_, colIndex) => {
		return Math.max(...data.map(row => row[colIndex].length));
	});
	let messages = [];
	let message = `\`\`\`\n`
	let row;

	for (let i = 0; i < data.length; i++) {
		const game = data[i]
		row = game.map((item, colIndex) => {
			return item.padEnd(colWidths[colIndex], ' ');
		}).join('\t');
		if ((`${message}\n${row}\n\`\`\``).length < 1960) {
			message += '\n' + row
		}
		else {
			messages.push(`${message}\n\`\`\``)
			message = `\`\`\`\n` + row
		}
		if (i === data.length - 1) {
			messages.push(`${message}\n\`\`\``)
		}
	}
	return messages
}

export const data = new SlashCommandBuilder()
	.setName('list_games')
	.setDescription('Lists the games the bot listens to for new achievements');
export async function execute(interaction) {
	const messages = list_games(interaction.guildId, interaction.client.data.games);
	for (let i = 0; i < messages.length; i++) {
		if (i == 0) {
			await interaction.reply(`Games I listen to for new achievements :${messages[i]}`);
		}
		else {
			interaction.channel.send(messages[i]);
		}
	}
}