import { SlashCommandBuilder } from 'discord.js';
import { displayAchievementActivityReport } from '../../discord/image_generation.cjs';

export const data = new SlashCommandBuilder()
    .setName('achievement-report')
    .setDescription('Generates a report of unlocked achievements for a specified period.')
    .addStringOption(option =>
        option.setName('period')
            .setDescription('The period for the report (last_24h, last_week, last_month, last_year).')
            .setRequired(true)
            .addChoices(
                { name: 'Last 24 Hours', value: 'last_24h' },
                { name: 'Last Week', value: 'last_week' },
                { name: 'Last Month', value: 'last_month' },
                { name: 'Last Year', value: 'last_year' },
            ));

export async function execute(interaction) {
    await interaction.deferReply();
    const period = interaction.options.getString('period');
    const report = await displayAchievementActivityReport(interaction.client, interaction.guildId, period);

    if (report.attachment) {
        await interaction.editReply({ files: [report.attachment] });
    } else {
        await interaction.editReply({ content: report.message });
    }
}