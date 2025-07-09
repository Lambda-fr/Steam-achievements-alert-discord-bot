import { SlashCommandBuilder } from 'discord.js';
import discordImageFunctions from '../../discord/image_generation.cjs'

export const data = new SlashCommandBuilder()
    .setName('history')
    .setDescription('Plot number of achievements history for all players on a specified game')
    .addStringOption(option => option.setName('game_name')
        .setDescription('name of the game as you specified it (do /list_games)')
        .setRequired(true))
    .addStringOption(option => option.setName('period')
        .setDescription('The period to display the history for. Defaults to all time.')
        .setRequired(false)
        .addChoices(
            { name: 'Last 30 days', value: '30d' },
            { name: 'Last 90 days', value: '90d' },
            { name: 'Last year', value: '365d' },
            { name: 'Last 2 years', value: '730d' },
            { name: 'Last 3 years', value: '1095d' },
            { name: 'Last 5 years', value: '1825d' },
            { name: 'All time', value: 'all' },
        ));
export async function execute(interaction) {
    try {
        await interaction.deferReply()
        const game_name = interaction.options.getString('game_name');
        const period = interaction.options.getString('period') ?? 'all'; // Default to 'all'

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
        let y_min = 0; // Default y-axis minimum

        if (period !== 'all') {
            const days = parseInt(period.slice(0, -1));
            const startTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

            let startIndex = all_timestamps.findIndex(ts => ts >= startTime);
            if (startIndex === -1) {
                startIndex = all_timestamps.length - 1;
            }
            if (startIndex > 0) startIndex = startIndex - 1;

            const sliced_timestamps = all_timestamps.slice(startIndex);
            const sliced_datasets = datasets.map(d => {
                const sliced_data = d.data.slice(startIndex);
                return { ...d, data: sliced_data };
            });

            sliced_timestamps.unshift(startTime);
            sliced_datasets.forEach(d => {
                d.data.unshift(d.data[0]);
            });

            all_timestamps = sliced_timestamps;
            datasets = sliced_datasets;

            // Calculate the minimum value for the y-axis
            const allDataPoints = datasets.flatMap(d => d.data);
            if (allDataPoints.length > 0) {
                y_min = Math.min(...allDataPoints);
            }
        }

        discordImageFunctions.displayAchievementsHistory(interaction, all_timestamps, datasets, gameRealName, y_min);
    } catch (error) {
        console.error('Error fetching game history:', error);
        await interaction.reply('An error occurred while fetching game history.');
    }


}