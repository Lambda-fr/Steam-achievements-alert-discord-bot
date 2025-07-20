import { SlashCommandBuilder } from 'discord.js';
import { saveGuildDataDB } from '../../connectAndQueryJSON.js';

export const data = new SlashCommandBuilder()
    .setName('set-new-achievements-display')
    .setDescription('Sets or disables the new achievements display.')
    .addBooleanOption(option =>
        option.setName('enabled')
            .setDescription('Enable or disable the new achievements display.')
            .setRequired(true))
    .addBooleanOption(option =>
        option.setName('display_all')
            .setDescription('Display achievements for all games, not just games added to the server list')
            .setRequired(false))
    .addChannelOption(option =>
        option.setName('channel')
            .setDescription('The channel to display new achievements in. Defaults to the current channel.')
            .setRequired(false));

export async function execute(interaction) {
    await interaction.deferReply();

    const enabled = interaction.options.getBoolean('enabled');
    const displayAll = interaction.options.getBoolean('display_all');
    const channel = interaction.options.getChannel('channel');

    const guildId = interaction.guildId;
    const guildData = interaction.client.data.guilds.find(g => g.id === guildId);

    if (!guildData) {
        await interaction.editReply('Could not find guild data. Please try again later.');
        return;
    }

    guildData.display_all_achievements = displayAll !== null ? displayAll : guildData.display_all_achievements;

    if (enabled) {
        guildData.achievements_channel_id = channel ? channel.id : interaction.channelId;
        guildData.achievements_channel = interaction.client.guilds.cache.get(interaction.guildId)?.channels.cache.find(c => c.id === guildData.achievements_channel_id);
        guildData.display_new_achievements_enabled = true;
        await interaction.editReply(`New achievements will be displayed in <#${guildData.achievements_channel_id}> !\n` + (guildData.display_all_achievements ? 'All achievements will be displayed.' : 'Only achievements from games added to the server list will be displayed.'));
    }
    else {
        guildData.display_new_achievements_enabled = false;
        await interaction.editReply('New achievements display has been disabled.');
    }

    console.log(`Guild ${guildId} new achievements display settings updated:`, {
        new_achievements_enabled: guildData.display_new_achievements_enabled,
        display_all_achievements: guildData.display_all_achievements,
        achievements_channel_id: guildData.achievements_channel_id,
        achievements_channel_name: guildData.achievements_channel ? guildData.achievements_channel.name : 'None',
    });

    await saveGuildDataDB(guildData);
}