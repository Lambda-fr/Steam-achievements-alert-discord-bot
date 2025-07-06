import { SlashCommandBuilder } from 'discord.js';
import { setGuildChannelAndDisplaySettingsDB } from '../../connectAndQueryJSON.js';

export const data = new SlashCommandBuilder()
    .setName('display_new_achievements_here')
    .setDescription('Sets the channel as the channel where new achievements are displayed')
    .addBooleanOption(option =>
        option.setName('display_all')
            .setDescription('Display achievements for all games, not just games added to the server list')
            .setRequired(true));
export async function execute(interaction) {
    const displayAll = interaction.options.getBoolean('display_all');
    await interaction.reply('New achievements will be displayed in this channel !\n' + (displayAll ? 'All achievements will be displayed.' : 'Only achievements from games added to the server list will be displayed.'));
    interaction.client.data.guilds.forEach(guild => {
        if (guild.id === interaction.guildId) {
            guild.channel_id = interaction.channelId;
            guild.channel = interaction.channel;
            guild.display_all_achievements = displayAll;
        }
        setGuildChannelAndDisplaySettingsDB(interaction.guildId, interaction.channelId, displayAll);
    });
    console.table(interaction.client.data.guilds);
}