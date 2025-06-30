import { SlashCommandBuilder } from 'discord.js';
import { changeChannelIdGuildDB } from '../../connectAndQueryJSON.js';

export const data = new SlashCommandBuilder()
    .setName('display_new_achievements_here')
    .setDescription('Sets the channel as the channel where new achievements are displayed');
export async function execute(interaction) {
    await interaction.reply('New achievements will be displayed in this channel !');
    interaction.client.data.guilds.forEach(guild => {
        if (guild.id === interaction.guildId) {
            guild.channel_id = interaction.channelId;
            guild.channel = interaction.channel;
        }
        changeChannelIdGuildDB(interaction.guildId, interaction.channelId);
    });
    console.table(interaction.client.data.guilds);
}