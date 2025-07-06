class Guild {
    constructor(guild_id) {
        this.id = guild_id;
        this.channel_id = null;
        this.channel = null;
        this.display_all_achievements = false;
    }
}

export default Guild