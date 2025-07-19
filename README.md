# Steam Achievements Discord Bot

This Discord bot displays unlocked Steam achievements in real-time and offers various features to track your game achievement progress. It uses the Discord and Steam APIs.

## Features

### 1. New Steam Achievement Unlocked Alerts

The bot sends messages (text and image) to a specified channel when a new achievement is detected for one of the registered players. This feature can display achievements for *all* games, even those not explicitly added to the bot's tracked games, once the notification channel is configured using `/set_new_achievements_display`. Updates occur every 60 seconds.

It also indicates which other players have already unlocked this achievement and the global unlock percentage. The player's current progress for the game is also displayed.

*   **Suggested Screenshot:** An example of an achievement unlocked alert message.

### 2. Achievement Listing Commands

The bot provides several commands to list and compare achievements for specific games. These commands allow you to view achievement progress, identify missing achievements, and compare your progress with other players.

*   **`/list_locked_achievements`**: Displays the progress of each player for a given game and their playtime. For the user executing the command, it lists achievements still locked, their global unlock percentage, and the avatars of other players who have already unlocked each achievement. The list is paginated.
    *   **Suggested Screenshot:** An example of the `/list_locked_achievements` command with the achievement list.

*   **`/list_compare_achievements`**: Displays achievements that are locked for the user executing the command AND that are unlocked by at least one other registered player. This helps identify achievements you might want to pursue that others in your group have already achieved.
    *   **Suggested Screenshot:** An example of the `/list_compare_achievements` command.

*   **`/list_all_achievements`**: Displays all achievements for a game, whether unlocked or not. This command can be used for *any* game, even if it hasn't been explicitly added to the bot's tracked games via `/add_game`. You just need to provide the game's App ID.
    *   **Suggested Screenshot:** An example of the `/list_all_achievements` command.

### 5. Player Progress (`/progress`)

Displays a player's progress on a specific game.

*   **Suggested Screenshot:** An example of the `/progress` command.

### 6. Achievement Unlock History (`/history`)

Displays the history of unlocked achievements for a specified game.

*   **Suggested Screenshot:** A graph or list of achievement history.

### 7. Achievement Leaderboard (`/leaderboard`)

Displays a leaderboard of players based on the number of achievements unlocked.

*   **Suggested Screenshot:** An example of the leaderboard.

### 8. Daily/Weekly Achievement Report (`/achievement_report`)

Generates a periodic report of unlocked achievements. Can be configured with `/set_achievement_report_schedule`.

*   **Suggested Screenshot:** An example of an achievement report.

### 9. Configuration and Management Commands

*   `/add_player`: Adds a player to track.
*   `/remove_player`: Removes a tracked player.
*   `/add_game`: Adds a game to track.
*   `/remove_game`: Removes a tracked game.
*   `/list_players`: Lists all tracked players.
*   `/list_games`: Lists all tracked games.
*   `/change_user_color`: Changes the color associated with a user in the bot's displays.
*   `/set_new_achievements_display`: Configures the channel where new achievement alerts should be sent.
*   `/set_achievement_report_schedule`: Configures the frequency and channel for achievement reports.
*   `/ping`: Checks the bot's latency.
*   `/refresh_owned_games`: Updates the list of games owned by players.

## Required Configuration

To use this bot, you will need the following:

*   **Steam Web API Key**: Obtain it from [https://steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey).
*   **Discord Bot Token & Client ID**: Create a bot application on the Discord developer portal: [https://discord.com/developers/applications](https://discord.com/developers/applications).

## Installation and Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/NicolasR14/Steam-achievements-alert-discord-bot.git
    cd Steam-achievements-alert-discord-bot
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Prepare configuration files:**
    The `setup.js` script will create `config.json` and `src/data.json` if they don't already exist.
    ```bash
    node setup.js
    ```
    *   If `config.json` is created, it will contain default values. You will need to modify it.

4.  **Fill `config.json`:**
    Open the `config.json` file (located at the root of the project) and fill in the following information:
    ```json
    {
      "API_Steam_key": "YOUR_STEAM_API_KEY",
      "clientId": "YOUR_DISCORD_CLIENT_ID",
      "guildId": ["YOUR_DISCORD_SERVER_ID_1", "YOUR_DISCORD_SERVER_ID_2"],
      "discord_token": "YOUR_DISCORD_BOT_TOKEN",
      "lang": "english"
    }
    ```
    *   `API_Steam_key`: Your Steam API key.
    *   `clientId`: Your Discord bot application ID.
    *   `guildId`: An array containing the IDs of the Discord servers where the bot will be used. You can find a server's ID by enabling developer mode in Discord (User Settings > Advanced) then right-clicking on the server.
    *   `discord_token`: Your Discord bot token.
    *   `lang`: The language for Steam information (e.g., "french", "english").

5.  **Deploy Slash Commands:**
    The `setup.js` script also deploys the bot's slash commands to Discord. Make sure `config.json` is correctly filled before running this step.
    ```bash
    node setup.js
    ```
    You should see confirmation messages in the console indicating that the commands have been reloaded for your servers.

6.  **Start the bot:**
    ```bash
    node index.js
    ```
    The bot should now be online on your Discord server.

## Initial Usage

After starting the bot:

1.  **Add players and games:** Use the `/add_player` and `/add_game` commands to start tracking achievements.
2.  **Set notification channel:** Use the `/set_new_achievements_display` command in the channel where you want to receive new achievement alerts.

Feel free to explore the other configuration commands to customize the bot's behavior.
