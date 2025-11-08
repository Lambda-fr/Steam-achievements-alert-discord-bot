export function createGameAutocomplete() {
    return async function (interaction) {
        const focusedValue = interaction.options.getFocused();
        const guildId = interaction.guildId;

        const guildGames = Array.from(interaction.client.data.games.values())
            .filter(game => game.guilds.includes(guildId));

        const choices = [];

        for (const game of guildGames) {
            if (game.realName && game.realName.toLowerCase().includes(focusedValue.toLowerCase())) {
                choices.push({ name: game.realName, value: game.id });
            }
            else if (game.name && game.name.toLowerCase().includes(focusedValue.toLowerCase())) {
                choices.push({ name: game.name, value: game.id });
            }
        }

        const limitedChoices = choices.slice(0, 25);
        await interaction.respond(limitedChoices);
    };
}