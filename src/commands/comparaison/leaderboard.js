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
    // Update owned games data for all users in the guild
    //await interaction.editReply(`Updating owned games data for ${guildUsers.length} users...`);

    // Fetch and update owned games data for each user
    await Promise.all(guildUsers.map(user => user.updateOwnedGamesData().catch(err => {
        console.error(`Error updating owned games for user ${user.nickname}:`, err);
    })));
    // get the total number of achievements unlocked and the number of games finished at 100% for each user
    // await interaction.editReply(`Calculating leaderboard...`);

    // Create leaderboard data
    // Each entry will contain the user and the number of completed games
    // Sort the leaderboard by the number of completed games in descending order
    // Also include the total number of achievements unlocked for each user 
    const leaderboardData = guildUsers.map(user => {
        const completedGames = user.ownedGames.filter(game => game.isCompleted100Percent);
        const numberOfCompletedGames = completedGames.length;
        const totalUnlockedAchievements = user.ownedGames.reduce((acc, game) => acc + game.nbUnlockedAchievements, 0);
        return {
            user: user,
            numberOfCompletedGames: numberOfCompletedGames,
            completedGames: completedGames,
            totalUnlockedAchievements: totalUnlockedAchievements
        };
    }).sort((a, b) => b.numberOfCompletedGames - a.numberOfCompletedGames);
    await discordImageFunctions.displayLeaderboard(interaction, leaderboardData);
}