import discordImageFunctions from '../discord/image_generation.cjs';

class Achievement {
    constructor(game, achievementId, achievementName, achievementDescription) {
        this.game = game;
        this.achievementId = achievementId;
        this.achievementName = achievementName;
        this.achievementDescription = achievementDescription;
        this.playersUnlockTime = {}
        this.globalPercentage
        this.icon
    }

    async displayDiscordNewAchievement(users, guild, author, position) {
        await discordImageFunctions.displayNewAchievementImage(this, users, guild, author, position);
    }
}

export default Achievement