import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';

const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

export const data = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Displays useful information about the bot');

export async function execute(interaction) {
	const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });

	const uptime = process.uptime();
	const uptimeMonths = Math.floor(uptime / (30 * 24 * 3600));
	const uptimeDays = Math.floor((uptime % (30 * 24 * 3600)) / (24 * 3600));
	const uptimeHours = Math.floor((uptime % (24 * 3600)) / 3600);

	const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle('Steam Bot Info 🏆')
		.addFields(
			{ name: 'Version', value: `v${packageJson.version}`, inline: true },
			{ name: 'Latency', value: `${sent.createdTimestamp - interaction.createdTimestamp}ms`, inline: true },
			{ name: 'Uptime', value: `${uptimeMonths}m ${uptimeDays}d ${uptimeHours}h`, inline: true },
			{ name: 'GitHub Repository', value: `[Lambda-fr/Steam-achievements-alert-discord-bot](${packageJson.repository.url.replace('git+', '').replace('.git', '')})`, inline: false },
		)
		.setTimestamp();

	await interaction.editReply({ content: '', embeds: [embed] });
}
