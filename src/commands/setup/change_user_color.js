import { SlashCommandBuilder } from 'discord.js';
import { changeColorDB } from '../../connectAndQueryJSON.js';

export const data = new SlashCommandBuilder()
    .setName('change_color_player')
    .setDescription('Change the color for a player (format : #FFFFFF)')
    .addUserOption(option => option.setName('player_mention')
        .setDescription('player mention')
        .setRequired(true))
    .addStringOption(option => option.setName('color')
        .setDescription('the color (format : #FFFFFF)')
        .setRequired(true));
export async function execute(interaction) {
    const discord_id = interaction.options.getUser('player_mention').id;
    const color = interaction.options.getString('color');

    let Reg_Exp = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i;
    if (!Reg_Exp.test(color)) {
        await interaction.reply('Wrong color code. Please use format : #FFFFFF');
        return;
    }
    var userObject = interaction.client.data.users.find(user => user.discord_id === discord_id);

    try {
        if (userObject) {
            changeColorDB(discord_id, color);
            userObject.color = color === '#FFFFFF' ? '#FEFEFE' : color; // If color is white, change to light gray
            await interaction.reply('Player color updated');
            return;
        }
        else {
            await interaction.reply('Player not found');
            return;
        }
    }
    catch (error) {
        console.error(error.message);
        await interaction.reply('Error');
    }
}