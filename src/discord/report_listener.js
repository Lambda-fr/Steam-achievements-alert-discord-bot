
import { displayAchievementActivityReport } from '../discord/image_generation.cjs';
import { saveGuildDataDB } from '../connectAndQueryJSON.js';


async function checkAndSendReports(client) {
    console.log('Checking for guilds that need achievement reports...');
    const guilds = client.data.guilds;

    for (const guild of guilds) {
        console.log(`\tChecking guild ${guild.id} for report requirements...`);
        console.log(`\t\tReport enabled: ${guild.report_enabled}, Interval: ${guild.report_interval}, Next report timestamp: ${guild.next_report_timestamp}`);
        if (!guild.report_enabled || !guild.report_interval || !guild.channel_id) {
            continue;
        }

        const now = Math.floor(Date.now() / 1000);
        let nextReportTime = guild.next_report_timestamp || now; // If not set, schedule for now.

        if (now >= nextReportTime) {
            const period = getPeriodFromInterval(guild.report_interval);
            if (period) {
                console.log(`Sending ${guild.report_interval} report for guild ${guild.id}`);
                const channel = await client.channels.fetch(guild.channel_id);
                try {
                    const report = await displayAchievementActivityReport(client, guild.id, period);

                    if (report.attachment) {
                        await channel.send({ files: [report.attachment] });
                    } else {
                        await channel.send({ content: report.message });
                    }

                    // Calculate next report time, catching up if needed
                    const intervalSeconds = getIntervalSeconds(guild.report_interval);
                    let newNextReportTime = nextReportTime;
                    while (newNextReportTime <= now) {
                        newNextReportTime += intervalSeconds;
                    }
                    guild.next_report_timestamp = newNextReportTime;

                    // Persist the new timestamp
                    await saveGuildDataDB(guild);

                } catch (error) {
                    console.error(`Error generating or sending achievement report for guild ${guild.id}:`, error);
                }
            }
        }
    }
}

function getIntervalSeconds(interval) {
    switch (interval) {
        case 'daily':
            return 24 * 60 * 60;
        case 'weekly':
            return 7 * 24 * 60 * 60;
        case 'monthly':
            return 30 * 24 * 60 * 60; // Approximation
        default:
            return 0;
    }
}

function getPeriodFromInterval(interval) {
    switch (interval) {
        case 'daily':
            return 'last_24h';
        case 'weekly':
            return 'last_week';
        case 'monthly':
            return 'last_month';
        default:
            return null;
    }
}

export function startReportScheduler(client) {
    console.log('Starting achievement report scheduler...');
    // Check every hour
    setInterval(() => checkAndSendReports(client), 60 * 60 * 1000);
    // Initial check on startup after a short delay
    setTimeout(() => checkAndSendReports(client), 10 * 1000);
}
