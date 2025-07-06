import { SlashCommandBuilder } from 'discord.js';
import discordImageFunctions from '../../discord/image_generation.cjs'

export const data = new SlashCommandBuilder()
    .setName('history')
    .setDescription('Plot number of achievements history for all players on a specified game')
    .addStringOption(option => option.setName('game_name')
        .setDescription('name of the game as you specified it (do /list_games)')
        .setRequired(true));
export async function execute(interaction) {
    try {
        await interaction.deferReply()
        const game_name = interaction.options.getString('game_name');
        const gameObject = Array.from(interaction.client.data.games.values()).find(game => game.name === game_name || game.aliases.includes(game_name));

        if (typeof gameObject === 'undefined') {
            await interaction.editReply('Game not found!');
            return;
        }
        if (!gameObject.guilds.includes(interaction.guildId)) {
            await interaction.editReply('Game not in the guild list!');
            return;
        }

        let [all_timestamps, datasets, gameRealName] = gameObject.getAchievementsHistory(interaction.guildId, interaction.client.data.users);
        discordImageFunctions.displayAchievementsHistory(interaction, all_timestamps, datasets, gameRealName);
    } catch (error) {
        console.error('Error fetching game history:', error);
        await interaction.reply('An error occurred while fetching game history.');
    }


}