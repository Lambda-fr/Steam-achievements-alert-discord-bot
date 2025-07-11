import { SlashCommandBuilder } from 'discord.js';
import { saveGuildDataDB } from '../../connectAndQueryJSON.js';
import { checkAndSendReports } from '../../discord/report_listener.js';

export const data = new SlashCommandBuilder()
    .setName('set-achievements-report-schedule')
    .setDescription('Sets or disables the automatic achievement activity report.')
    .addStringOption(option =>
        option.setName('interval')
            .setDescription('The frequency of the report.')
            .setRequired(true)
            .addChoices(
                { name: 'Daily', value: 'daily' },
                { name: 'Weekly', value: 'weekly' },
                { name: 'Monthly', value: 'monthly' },
                { name: 'Disable', value: 'none' },
            ))
    .addIntegerOption(option =>
        option.setName('first-report-timestamp')
            .setDescription('The timestamp for the first report. If not specified, the current time will be used.')
            .setRequired(false));

export async function execute(interaction) {
    await interaction.deferReply();

    const interval = interaction.options.getString('interval');
    const firstReportTimestamp = interaction.options.getInteger('first-report-timestamp');

    const guildId = interaction.guildId;
    const guildData = interaction.client.data.guilds.find(g => g.id === guildId);

    if (!guildData) {
        await interaction.editReply('Could not find guild data. Please try again later.');
        return;
    }

    if (interval === 'none') {
        guildData.report_enabled = false;
        guildData.report_interval = null;
        await interaction.editReply('Automatic achievement reports have been disabled.');
    } else {
        guildData.channel_id = guildData.channel_id || interaction.channelId; // Ensure channel_id is set, if not already
        guildData.report_enabled = true;
        guildData.report_interval = interval;
        guildData.next_report_timestamp = firstReportTimestamp || null; // Set next report timestamp to the provided value or null
        await interaction.editReply(`Automatic achievement reports will now be sent ${interval} starting ${guildData.next_report_timestamp ? new Date(guildData.next_report_timestamp * 1000).toUTCString() : 'immediately'}.`); // Display UTC time in local format
    }

    console.log(`Guild ${guildId} report settings updated:`, {
        report_enabled: guildData.report_enabled,
        report_interval: guildData.report_interval,
        next_report_timestamp: guildData.next_report_timestamp,
        channel_id: guildData.channel_id
    });
    // Save the updated guild data to the database
    checkAndSendReports(interaction.client); // Check and send reports immediately after setting the schedule
    await saveGuildDataDB(guildData);

}
