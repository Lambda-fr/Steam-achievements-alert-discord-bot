import { SlashCommandBuilder } from '@discordjs/builders';

export const data = new SlashCommandBuilder()
    .setName('refresh_owned_games')
    .setDescription('Refresh owned games data for all players.');

export async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
        const guildUsers = interaction.client.data.users.filter(user => user.guilds.includes(interaction.guildId));
        let updatedCount = 0;
        let errorCount = 0;

        for (const user of guildUsers) {
            const success = await user.updateOwnedGamesData(interaction.client.data);
            if (success) {
                updatedCount++;
            } else {
                errorCount++;
            }
        }

        await interaction.editReply(`Owned games data refreshed for ${updatedCount} users. ${errorCount} users failed to update.`);
    } catch (error) {
        console.error('Error refreshing owned games data:', error);
        await interaction.editReply('An error occurred while refreshing owned games data.');
    }
}
