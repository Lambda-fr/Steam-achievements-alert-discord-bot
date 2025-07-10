import { displayAchievementActivityReport } from '../src/discord/image_generation.cjs';
import { writeFileSync } from 'fs';
import { loadImage } from "canvas";

// Mock data for testing displayAchievementActivityReport
const mockUsers = [
    {
        steam_id: '76561198000000001',
        discord_id: '123456789012345678',
        nickname: 'PlayerOne',
        avatar: await loadImage('https://cdn.discordapp.com/embed/avatars/0.png'),
        guilds: ['1234567890123456789']
    },
    {
        steam_id: '76561198000000002',
        discord_id: '234567890123456789',
        nickname: 'PlayerTwo',
        avatar: await loadImage('https://cdn.discordapp.com/embed/avatars/1.png'),
        guilds: ['1234567890123456789']
    },
    {
        steam_id: '76561198000000003',
        discord_id: '345678901234567890',
        nickname: 'PlayerThree',
        avatar: await loadImage('https://cdn.discordapp.com/embed/avatars/2.png'),
        guilds: ['1234567890123456789']
    },
    {
        steam_id: '76561198000000004',
        discord_id: '456789012345678901',
        nickname: 'PlayerFour',
        avatar: await loadImage('https://cdn.discordapp.com/embed/avatars/3.png'),
        guilds: ['1234567890123456789']
    },
];

const mockGames = new Map();
// Current timestamp in seconds
const now = parseInt(Date.now() / 1000);
// 12 hours ago
const twelveHoursAgo = now - (12 * 60 * 60);
// 3 days ago
const threeDaysAgo = now - (3 * 24 * 60 * 60);
// 10 days ago
const tenDaysAgo = now - (10 * 24 * 60 * 60);
// 20 days ago
const twentyDaysAgo = now - (20 * 24 * 60 * 60);
// 40 days ago
const fortyDaysAgo = now - (40 * 24 * 60 * 60);

mockGames.set(100, {
    id: 100,
    realName: 'Game A',
    img: 'https://cdn.discordapp.com/embed/avatars/0.png',
    achievements: {
        'ach1': { achievementName: 'Ach A1', icon: 'https://cdn.discordapp.com/embed/avatars/0.png', playersUnlockTime: { '76561198000000001': twelveHoursAgo } },
        'ach2': { achievementName: 'Ach A2', icon: 'https://cdn.discordapp.com/embed/avatars/1.png', playersUnlockTime: { '76561198000000001': threeDaysAgo } },
        'ach3': { achievementName: 'Ach A3', icon: 'https://cdn.discordapp.com/embed/avatars/2.png', playersUnlockTime: { '76561198000000003': fortyDaysAgo } },
    }
});
mockGames.set(200, {
    id: 200,
    realName: 'Game B',
    img: 'https://cdn.discordapp.com/embed/avatars/1.png',
    achievements: {
        'ach4': { achievementName: 'Ach B1', icon: 'https://cdn.discordapp.com/embed/avatars/3.png', playersUnlockTime: { '76561198000000002': twelveHoursAgo } },
        'ach5': { achievementName: 'Ach B2', icon: 'https://cdn.discordapp.com/embed/avatars/4.png', playersUnlockTime: { '76561198000000002': tenDaysAgo } },
        'ach6': { achievementName: 'Ach B3', icon: 'https://cdn.discordapp.com/embed/avatars/5.png', playersUnlockTime: { '76561198000000004': twentyDaysAgo } },
    }
});
mockGames.set(300, {
    id: 300,
    realName: 'Game C',
    img: 'https://cdn.discordapp.com/embed/avatars/2.png',
    achievements: {
        'ach7': { achievementName: 'Ach C1', icon: 'https://cdn.discordapp.com/embed/avatars/0.png', playersUnlockTime: { '76561198000000001': twelveHoursAgo } },
        'ach8': { achievementName: 'Ach C2', icon: 'https://cdn.discordapp.com/embed/avatars/1.png', playersUnlockTime: { '76561198000000003': threeDaysAgo } },
    }
});
mockGames.set(400, {
    id: 400,
    realName: 'Game D',
    img: 'https://cdn.discordapp.com/embed/avatars/3.png',
    achievements: {
        'ach9': { achievementName: 'Ach D1', icon: 'https://cdn.discordapp.com/embed/avatars/2.png', playersUnlockTime: { '76561198000000004': twelveHoursAgo } },
    }
});

// Add ownedGames to mockUsers
mockUsers[0].ownedGames = [100, 300];
mockUsers[1].ownedGames = [200];
mockUsers[2].ownedGames = [100, 300];
mockUsers[3].ownedGames = [200, 400];

const mockInteraction = {
    guildId: '1234567890123456789',
    client: {
        data: {
            users: mockUsers,
            games: mockGames,
        }
    },
    editReply: async ({ files }) => {
        console.log('--- Mock interaction.editReply called ---');
        if (files && files.length > 0) {
            console.log('Files:', files.length, 'attachment(s)');
            const buffer = files[0].attachment;
            writeFileSync('test_achievement_report_output.png', buffer);
            console.log('Achievement report image saved to test_achievement_report_output.png');
        } else {
            console.log('No files attached to reply.');
        }
    },
    deferReply: async () => {
        console.log('Mock interaction.deferReply called.');
    }
};

// Run the test
(async () => {
    console.log('Running test for displayAchievementActivityReport (last_24h)...');
    const report24h = await displayAchievementActivityReport(mockInteraction.client, mockInteraction.guildId, 'last_24h');
    if (report24h.attachment) {
        writeFileSync('test_achievement_report_output.png', report24h.attachment.attachment);
        console.log('Achievement report image saved to test_achievement_report_output.png');
    } else {
        console.log(report24h.message);
    }
    console.log('Test finished for last_24h.');

    console.log('Running test for displayAchievementActivityReport (last_week)...');
    const reportWeek = await displayAchievementActivityReport(mockInteraction.client, mockInteraction.guildId, 'last_week');
    if (reportWeek.attachment) {
        writeFileSync('test_achievement_report_last_week_output.png', reportWeek.attachment.attachment);
        console.log('Achievement report image saved to test_achievement_report_last_week_output.png');
    } else {
        console.log(reportWeek.message);
    }
    console.log('Test finished for last_week.');

    console.log('Running test for displayAchievementActivityReport (last_month)...');
    const reportMonth = await displayAchievementActivityReport(mockInteraction.client, mockInteraction.guildId, 'last_month');
    if (reportMonth.attachment) {
        writeFileSync('test_achievement_report_last_month_output.png', reportMonth.attachment.attachment);
        console.log('Achievement report image saved to test_achievement_report_last_month_output.png');
    } else {
        console.log(reportMonth.message);
    }
    console.log('Test finished for last_month.');
})();