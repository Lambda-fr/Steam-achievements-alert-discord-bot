# Steam Achievements Discord Bot

This Discord bot displays unlocked Steam achievements in real-time and offers various features to track your game achievement progress. It uses the Discord and Steam APIs.

## Features

### 1. New Steam Achievement Unlocked Alerts

The bot sends messages (text and image) to a specified channel when a new achievement is detected for one of the registered players. Updates occur every 60 seconds.
This feature can either display achievements only for tracked games (those registered with `/add-game`) or for *all* games, as configured with `/set_new_achievements_display`. 

It also indicates which other players have already unlocked this achievement and the global unlock percentage. The player's current progress for the game is also displayed.

<img width="637" height="232" alt="image" src="https://github.com/user-attachments/assets/22a00623-4519-4e1f-9a06-128e93a01ff7" />

### 2. Achievement Listing Commands

The bot provides several commands to list and compare achievements for specific games. These commands allow you to view achievement progress, identify missing achievements, and compare your progress with your friends!

*   **`/list_locked_achievements`**: For the user executing the command, it lists achievements still locked, their global unlock percentage, and the avatars of other players who have already unlocked each achievement.
      <img width="555" height="491" alt="image" src="https://github.com/user-attachments/assets/05247cc5-43d4-4b19-b798-14fd7aa268f3" />

*   **`/list_compare_achievements`**: Displays achievements that are locked for the user executing the command AND that are unlocked by at least one other registered player. This helps identify achievements you might want to pursue that others in your group have already achieved.

*   **`/list_all_achievements`**: Displays all achievements for a game, whether unlocked or not. 

*   **`/progress`**: Displays the progress of each player for a given game and their playtime.
        <img width="524" height="405" alt="image" src="https://github.com/user-attachments/assets/1e0ae45a-9b43-4f7f-b8ef-8203d62577b3" />


### 3. Achievement Unlock History (`/history`)

Displays the history of the number of unlocked achievements for a specified game.

<img width="698" height="493" alt="image" src="https://github.com/user-attachments/assets/3cecea61-2112-4038-a736-9bcc040b9acd" />


### 4. Achievement Leaderboard (`/leaderboard`)

Displays a leaderboard of players based on the number of games completed. Also displays the total number of achievements unlocked in any games.

<img width="465" height="498" alt="image" src="https://github.com/user-attachments/assets/a813b6ac-543d-4c05-9b8c-ef3119e0a9cb" />


### 5. Achievement Report (`/achievement_report` and `/set-achievements-report-schedule`)

*   **`/achievement_report`**: Generates a report of unlocked achievements for a specified period (last 24 hours, last week, last month, or last year).
*   **`/set-achievements-report-schedule`**: Configures an automatic report to be sent periodically (daily, weekly, or monthly) to a designated channel. You can also specify a timestamp for the first report or disable the automatic reports.

<img width="373" height="688" alt="image" src="https://github.com/user-attachments/assets/2a7bde19-4537-4cab-95d2-70bf1c41af59" />


### 6. Configuration and Management Commands

*   `/add_player`: Adds a player to track. You need to provide the Steam ID for each player you want to track. For the bot to function correctly, players must set their basic and game details to "Public" on Steam at [https://steamcommunity.com/id/superlambda/edit/settings](https://steamcommunity.com/id/superlambda/edit/settings). Additionally, ensure the "Always keep my total playtime private even if users can see my game details" option is unchecked.
*   `/remove_player`: Removes a tracked player.
*   `/add_game`: Registers a game. Needed to list achievements, display progress, and history of a specific game. 
*   `/remove_game`: Removes a registered game.
*   `/list_players`: Lists all tracked players.
*   `/list_games`: Lists all registered games.
*   `/change_user_color`: Changes the color associated with a user in the history.
*   `/set_new_achievements_display`: Configures the channel where new achievement alerts should be sent, and indicates if all games should be tracked.
*   `/set_achievement_report_schedule`: Configures the frequency and channel for achievement reports.
*   `/ping`: Checks the bot's liveness.
*   `/refresh_owned_games`: Updates the list of games owned by players. Use this when owned games of a specific player were not fetched correctly (e.g., total playtime is missing or games are missing in the leaderboard).

## Required Configuration

To use this bot, you will need the following:

*   **Steam Web API Key**: Obtain it from [https://steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey).
*   **Discord Bot Token & Client ID**: Create a bot application on the Discord developer portal: [https://discord.com/developers/applications](https://discord.com/developers/applications).

## Installation and Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Lambda-fr/Steam-achievements-alert-discord-bot.git
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

1.  **Add players and games:** Use the `/add_player` and `/add_game` commands to start tracking achievements and to use game-specific commands.
2.  **Set notification channel:** Use the `/set_new_achievements_display` command in the channel where you want to receive new achievement alerts.
3. **Set automatic report :** Use the `/set-achievements-report-schedule` command if you want to set periodic report.
