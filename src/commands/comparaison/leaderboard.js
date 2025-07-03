import { SlashCommandBuilder } from 'discord.js';
import discordImageFunctions from '../../discord/image_generation.cjs'

export const data = new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Display an overall leaderboard of the total number of achievements unlocked')

export async function execute(interaction) {
    try {
        await updateLeaderboard(interaction);
    } catch (error) {
        console.error('Error executing leaderboard command:', error);
        await interaction.editReply('An error occurred while generating the leaderboard. Please try again later.');
    }
}

async function updateLeaderboard(interaction) {
    try {
        // Check if the user has permission to execute this command
        if (!interaction.member.permissions.has('ManageGuild')) {
            await interaction.reply('You do not have permission to use this command.');
            return;
        }

        // Defer the reply to allow time for processing             
        await interaction.deferReply();
        const guildUsers = interaction.client.data.users.filter(user => user.guilds.includes(interaction.guildId));

        if (guildUsers.length === 0) {
            await interaction.editReply('No users found in this guild.');
            return;
        }

        const leaderboardData = guildUsers.map(user => {
            const completedGames = user.ownedGames.map(gameId => {
                const game = interaction.client.data.games.get(gameId);
                if (game && game.isCompleted100Percent[user.steam_id]) {
                    return game;
                }
            }).filter(g => g);

            const numberOfCompletedGames = completedGames.length;
            const totalUnlockedAchievements = user.ownedGames.reduce((acc, gameId) => {
                const game = interaction.client.data.games.get(gameId);
                return acc + (game && game.nbUnlocked[user.steam_id] ? game.nbUnlocked[user.steam_id] : 0);
            }, 0);

            return {
                user: user,
                numberOfCompletedGames: numberOfCompletedGames,
                completedGames: completedGames,
                totalUnlockedAchievements: totalUnlockedAchievements
            };
        }).sort((a, b) => b.numberOfCompletedGames - a.numberOfCompletedGames);
        await discordImageFunctions.displayLeaderboard(interaction, leaderboardData);
    } catch (error) {
        console.error('Error updating leaderboard:', error);
        await interaction.editReply('An error occurred while updating the leaderboard. Please try again later.');
    }
    await interaction.editReply('Leaderboard updated successfully!');
}