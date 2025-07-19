class Guild {
    constructor(guild_id) {
        this.id = guild_id;
        this.channel_id = null;
        this.channel = null;
        this.display_all_achievements = false;
        this.display_new_achievements_enabled = false;
        this.report_enabled = false;
        this.report_interval = null; // 'daily', 'weekly', 'monthly' or 'none'
        this.next_report_timestamp = null;
    }
}

export default Guild