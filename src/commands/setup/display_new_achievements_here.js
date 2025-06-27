import { SlashCommandBuilder } from 'discord.js';
import { changeChannelIdGuildDB } from '../../connectAndQueryJSON.js';

export const data = new SlashCommandBuilder()
    .setName('display_new_achievements_here')
    .setDescription('Sets the channel as the channel where new achievements are displayed');
export async function execute(interaction, globalVariables) {
    await interaction.reply('New achievements will be displayed in this channel !');
    globalVariables.Guilds.forEach(guild => {
        if (guild.id === interaction.guildId) {
            guild.channel_id = interaction.channelId;
            guild.channel = interaction.channel;
        }
        changeChannelIdGuildDB(interaction.guildId, interaction.channelId);
    });
    console.table(globalVariables.Guilds);
}