import { SlashCommandBuilder } from 'discord.js';
import discordImageFunctions from '../../discord_loadimages.cjs'

export const data = new SlashCommandBuilder()
    .setName('history')
    .setDescription('Plot number of achievements history for all players on a specified game')
    .addStringOption(option => option.setName('game_name')
        .setDescription('name of the game as you specified it (do /list_games)')
        .setRequired(true));
export async function execute(interaction, globalVariables) {
    const game_name = interaction.options.getString('game_name');
    const gameObject = globalVariables.Games.find(game => game.name === game_name || game.aliases.includes(game_name));
    if (typeof gameObject === 'undefined') {
        await interaction.reply('Game not found!');
        return;
    }
    if (!gameObject.guilds.includes(interaction.guildId)) {
        await interaction.reply('Game not in the guild list!');
        return;
    }

    let [all_timestamps, datasets, gameRealName] = gameObject.getAchievementsHistory(interaction);
    discordImageFunctions.displayAchievementsHistory(interaction, all_timestamps, datasets, gameRealName);

}