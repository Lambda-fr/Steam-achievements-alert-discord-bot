import { SlashCommandBuilder } from 'discord.js';
import { displayAchievementActivityReport } from '../../discord/image_generation.cjs';

export const data = new SlashCommandBuilder()
    .setName('achievement-report')
    .setDescription('Generates a report of unlocked achievements for a specified period.')
    .addStringOption(option =>
        option.setName('period')
            .setDescription('The period for the report (last_24h, last_week, last_month).')
            .setRequired(true)
            .addChoices(
                { name: 'Last 24 Hours', value: 'last_24h' },
                { name: 'Last Week', value: 'last_week' },
                { name: 'Last Month', value: 'last_month' },
            ));

export async function execute(interaction) {
    await interaction.deferReply();
    const period = interaction.options.getString('period');
    await displayAchievementActivityReport(interaction, period);
}