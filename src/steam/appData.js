import Game from '../models/Game.js';

async function getOrAddGame(appData, gameId, imgUrl = null, userId = null) {
    try {
        // Check if the gameId already exists in appData.games
        const gameFound = appData.games.get(parseInt(gameId));
        if (gameFound) {
            //console.warn(`Game with ID ${gameId} already exists in appData.`);
            if (!gameFound.img && imgUrl) {
                gameFound.img = imgUrl;
            }
            // If a userId is provided, update achievements for that user
            if (userId) {
                await gameFound.updateAchievementsForUser(appData, userId);
                gameFound.owned = true;
            }
            return gameFound;
        }

        // If the gameId is valid and not already in appData.games, create a new Game instance
        let newGame = new Game(gameId, imgUrl);
        appData.games.set(gameId, newGame);

        // If a userId is provided, update achievements for that user
        if (userId) {
            //console.log(`Game with ID ${gameId} added to appData.`);
            await newGame.updateAchievementsForUser(appData, userId);
            newGame.owned = true;
        }
        else {
            console.log(`Game with ID ${gameId} is valid and not in appData, adding to appData.`);
            await newGame.addBaseInfo();
        }
        return newGame;
    } catch (error) {
        return null;

    }
}

export { getOrAddGame };