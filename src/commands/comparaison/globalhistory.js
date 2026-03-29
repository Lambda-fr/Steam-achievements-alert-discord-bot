import { SlashCommandBuilder } from 'discord.js';
import discordImageFunctions from '../../discord/image_generation.cjs';

export const data = new SlashCommandBuilder()
    .setName('globalhistory')
    .setDescription('Plot the total number of achievements history for all players across all games')
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
        ))
    .addUserOption(option => option.setName('player1').setDescription('First player to compare').setRequired(false))
    .addUserOption(option => option.setName('player2').setDescription('Second player to compare').setRequired(false))
    .addUserOption(option => option.setName('player3').setDescription('Third player to compare').setRequired(false))
    .addUserOption(option => option.setName('player4').setDescription('Fourth player to compare').setRequired(false))
    .addUserOption(option => option.setName('player5').setDescription('Fifth player to compare').setRequired(false));

export async function execute(interaction) {
    try {
        await interaction.deferReply();
        const period = interaction.options.getString('period') ?? 'all'; // Default to 'all'

        // --- Player Filtering ---
        const specifiedUsers = [
            interaction.options.getUser('player1'),
            interaction.options.getUser('player2'),
            interaction.options.getUser('player3'),
            interaction.options.getUser('player4'),
            interaction.options.getUser('player5')
        ].filter(Boolean); // Filter out null/undefined values

        let usersToDisplay = interaction.client.data.users.filter(u => u.guilds.includes(interaction.guildId));
        if (specifiedUsers.length > 0) {
            const specifiedDiscordIds = specifiedUsers.map(u => u.id);
            usersToDisplay = usersToDisplay.filter(u => specifiedDiscordIds.includes(u.discord_id));
        }
        // --- End Player Filtering ---

        let all_timestamps_set = new Set();
        let userTimelines = new Map();

        // Gather all timetamps
        for (const user of usersToDisplay) {
            const sortedTimestamps = user.getSortedGlobalTimestamps();
            userTimelines.set(user.steam_id, sortedTimestamps);
            for (const ts of sortedTimestamps) {
                if (ts > 0) {
                    all_timestamps_set.add(ts);
                }
            }
        }

        let all_timestamps = Array.from(all_timestamps_set).sort((a, b) => a - b);
        
        if (all_timestamps.length === 0) {
            await interaction.editReply('No achievements found for the selected players.');
            return;
        }

        let all_timestamps_temp = [];
        let nbAchievementsList = {};
        let userCounts = {};

        for (const user of usersToDisplay) {
            nbAchievementsList[user.steam_id] = [];
            userCounts[user.steam_id] = 0;
        }

        // Apply staircase points
        all_timestamps.forEach(timestamp => {
            all_timestamps_temp.push(timestamp - 1);
            all_timestamps_temp.push(timestamp);
            
            for (const user of usersToDisplay) {
                const steamId = user.steam_id;
                const timeline = userTimelines.get(steamId);
                let currentCount = userCounts[steamId];
                
                let newlyUnlocked = 0;
                while (currentCount + newlyUnlocked < timeline.length && timeline[currentCount + newlyUnlocked] === timestamp) {
                    newlyUnlocked++;
                }
                
                const last_nb = currentCount;
                nbAchievementsList[steamId].push(last_nb);
                nbAchievementsList[steamId].push(last_nb + newlyUnlocked);
                
                userCounts[steamId] += newlyUnlocked; 
            }
        });

        all_timestamps = all_timestamps_temp.map(ts => new Date(ts * 1000));
        
        for (const user of usersToDisplay) {
             const last_nb = userCounts[user.steam_id];
             nbAchievementsList[user.steam_id].push(last_nb);
        }
        all_timestamps.push(Date.now());

        let datasets = [];
        for (const user of usersToDisplay) {
            datasets.push({
                data: nbAchievementsList[user.steam_id],
                borderColor: user.color,
                label: user.nickname
            });
        }

        let y_min = 0;

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

            const allDataPoints = datasets.flatMap(d => d.data);
            if (allDataPoints.length > 0) {
                y_min = Math.min(...allDataPoints);
            }
        }

        discordImageFunctions.displayAchievementsHistory(interaction, all_timestamps, datasets, 'All Games', y_min);
    } catch (error) {
        console.error('Error fetching global history:', error);
        if (interaction.deferred) {
            await interaction.editReply('An error occurred while fetching global history.');
        } else {
            await interaction.reply('An error occurred while fetching global history.');
        }
    }
}
