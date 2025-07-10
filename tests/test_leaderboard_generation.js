import { displayLeaderboard } from '../src/discord/image_generation.cjs';
import { writeFileSync } from 'fs';
import { loadImage } from "canvas";

// Mock data for testing displayLeaderboard
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
    {
        steam_id: '76561198000000005',
        discord_id: '567890123456789012',
        nickname: 'PlayerFive',
        avatar: await loadImage('https://cdn.discordapp.com/embed/avatars/4.png'),
        guilds: ['1234567890123456789']
    },
];

const mockLeaderboardData = [
    {
        user: mockUsers[0],
        completedGames: [
            { name: 'Game A', img: 'https://cdn.discordapp.com/embed/avatars/0.png' },
            { name: 'Game B', img: 'https://cdn.discordapp.com/embed/avatars/1.png' },
            { name: 'Game C', img: 'https://cdn.discordapp.com/embed/avatars/2.png' },
            { name: 'Game D', img: 'https://cdn.discordapp.com/embed/avatars/3.png' },
            { name: 'Game E', img: 'https://cdn.discordapp.com/embed/avatars/4.png' },
            { name: 'Game F', img: 'https://cdn.discordapp.com/embed/avatars/5.png' },
            { name: 'Game G', img: 'https://cdn.discordapp.com/embed/avatars/0.png' },
            { name: 'Game H', img: 'https://cdn.discordapp.com/embed/avatars/1.png' },
            { name: 'Game I', img: 'https://cdn.discordapp.com/embed/avatars/2.png' },
            { name: 'Game J', img: 'https://cdn.discordapp.com/embed/avatars/3.png' },
            { name: 'Game K', img: 'https://cdn.discordapp.com/embed/avatars/4.png' },
            { name: 'Game L', img: 'https://cdn.discordapp.com/embed/avatars/5.png' },
            { name: 'Game M', img: 'https://cdn.discordapp.com/embed/avatars/0.png' },
            { name: 'Game N', img: 'https://cdn.discordapp.com/embed/avatars/1.png' },
            { name: 'Game O', img: 'https://cdn.discordapp.com/embed/avatars/2.png' },
            { name: 'Game P', img: 'https://cdn.discordapp.com/embed/avatars/3.png' },
            { name: 'Game Q', img: 'https://cdn.discordapp.com/embed/avatars/4.png' },
            { name: 'Game R', img: 'https://cdn.discordapp.com/embed/avatars/5.png' },
            { name: 'Game S', img: 'https://cdn.discordapp.com/embed/avatars/0.png' },
            { name: 'Game T', img: 'https://cdn.discordapp.com/embed/avatars/1.png' },
            { name: 'Game U', img: 'https://cdn.discordapp.com/embed/avatars/2.png' },
            { name: 'Game V', img: 'https://cdn.discordapp.com/embed/avatars/3.png' },
            { name: 'Game W', img: 'https://cdn.discordapp.com/embed/avatars/4.png' },
            { name: 'Game X', img: 'https://cdn.discordapp.com/embed/avatars/5.png' },
            { name: 'Game Y', img: 'https://cdn.discordapp.com/embed/avatars/0.png' },
            { name: 'Game Z', img: 'https://cdn.discordapp.com/embed/avatars/1.png' },
            { name: 'Game AA', img: 'https://cdn.discordapp.com/embed/avatars/2.png' },
            { name: 'Game AB', img: 'https://cdn.discordapp.com/embed/avatars/3.png' },
            { name: 'Game AC', img: 'https://cdn.discordapp.com/embed/avatars/4.png' },
            { name: 'Game AD', img: 'https://cdn.discordapp.com/embed/avatars/5.png' },
            { name: 'Game AE', img: 'https://cdn.discordapp.com/embed/avatars/0.png' },
            { name: 'Game AF', img: 'https://cdn.discordapp.com/embed/avatars/1.png' },
            { name: 'Game AG', img: 'https://cdn.discordapp.com/embed/avatars/2.png' },
            { name: 'Game AH', img: 'https://cdn.discordapp.com/embed/avatars/3.png' },
            { name: 'Game AI', img: 'https://cdn.discordapp.com/embed/avatars/4.png' },
            { name: 'Game AJ', img: 'https://cdn.discordapp.com/embed/avatars/5.png' },
            { name: 'Game AK', img: 'https://cdn.discordapp.com/embed/avatars/0.png' },
            { name: 'Game AL', img: 'https://cdn.discordapp.com/embed/avatars/1.png' },
            { name: 'Game AM', img: 'https://cdn.discordapp.com/embed/avatars/2.png' },
            { name: 'Game AN', img: 'https://cdn.discordapp.com/embed/avatars/3.png' },
            { name: 'Game AO', img: 'https://cdn.discordapp.com/embed/avatars/4.png' },
            { name: 'Game AP', img: 'https://cdn.discordapp.com/embed/avatars/5.png' },
            { name: 'Game AQ', img: 'https://cdn.discordapp.com/embed/avatars/0.png' },
            { name: 'Game AR', img: 'https://cdn.discordapp.com/embed/avatars/1.png' },
            { name: 'Game AS', img: 'https://cdn.discordapp.com/embed/avatars/2.png' },
            { name: 'Game AT', img: 'https://cdn.discordapp.com/embed/avatars/3.png' },
            { name: 'Game AU', img: 'https://cdn.discordapp.com/embed/avatars/4.png' },
            { name: 'Game AV', img: 'https://cdn.discordapp.com/embed/avatars/5.png' },
            { name: 'Game AW', img: 'https://cdn.discordapp.com/embed/avatars/0.png' },
            { name: 'Game AX', img: 'https://cdn.discordapp.com/embed/avatars/1.png' },
            { name: 'Game AY', img: 'https://cdn.discordapp.com/embed/avatars/2.png' },
            { name: 'Game AZ', img: 'https://cdn.discordapp.com/embed/avatars/3.png' },
            { name: 'Game BA', img: 'https://cdn.discordapp.com/embed/avatars/4.png' },
            { name: 'Game BB', img: 'https://cdn.discordapp.com/embed/avatars/5.png' },
            { name: 'Game BC', img: 'https://cdn.discordapp.com/embed/avatars/0.png' },
            { name: 'Game BD', img: 'https://cdn.discordapp.com/embed/avatars/1.png' },
            { name: 'Game BE', img: 'https://cdn.discordapp.com/embed/avatars/2.png' },
        ],
        totalUnlockedAchievements: 1500
    },
    {
        user: mockUsers[1],
        completedGames: [
            { name: 'Game A', img: 'https://cdn.discordapp.com/embed/avatars/0.png' },
            { name: 'Game B', img: 'https://cdn.discordapp.com/embed/avatars/1.png' },
            { name: 'Game C', img: 'https://cdn.discordapp.com/embed/avatars/2.png' },
            { name: 'Game D', img: 'https://cdn.discordapp.com/embed/avatars/3.png' },
            { name: 'Game E', img: 'https://cdn.discordapp.com/embed/avatars/4.png' },
            { name: 'Game F', img: 'https://cdn.discordapp.com/embed/avatars/5.png' },
            { name: 'Game G', img: 'https://cdn.discordapp.com/embed/avatars/0.png' },
            { name: 'Game H', img: 'https://cdn.discordapp.com/embed/avatars/1.png' },
            { name: 'Game I', img: 'https://cdn.discordapp.com/embed/avatars/2.png' },
            { name: 'Game J', img: 'https://cdn.discordapp.com/embed/avatars/3.png' },
            { name: 'Game K', img: 'https://cdn.discordapp.com/embed/avatars/4.png' },
            { name: 'Game L', img: 'https://cdn.discordapp.com/embed/avatars/5.png' },
            { name: 'Game M', img: 'https://cdn.discordapp.com/embed/avatars/0.png' },
            { name: 'Game N', img: 'https://cdn.discordapp.com/embed/avatars/1.png' },
            { name: 'Game O', img: 'https://cdn.discordapp.com/embed/avatars/2.png' },
            { name: 'Game P', img: 'https://cdn.discordapp.com/embed/avatars/3.png' },
            { name: 'Game Q', img: 'https://cdn.discordapp.com/embed/avatars/4.png' },
            { name: 'Game R', img: 'https://cdn.discordapp.com/embed/avatars/5.png' },
            { name: 'Game S', img: 'https://cdn.discordapp.com/embed/avatars/0.png' },
            { name: 'Game T', img: 'https://cdn.discordapp.com/embed/avatars/1.png' },
            { name: 'Game U', img: 'https://cdn.discordapp.com/embed/avatars/2.png' },
            { name: 'Game V', img: 'https://cdn.discordapp.com/embed/avatars/3.png' },
            { name: 'Game W', img: 'https://cdn.discordapp.com/embed/avatars/4.png' },
            { name: 'Game X', img: 'https://cdn.discordapp.com/embed/avatars/5.png' },
        ],
        totalUnlockedAchievements: 1200
    },
    {
        user: mockUsers[2],
        completedGames: [
            { name: 'Game A', img: 'https://cdn.discordapp.com/embed/avatars/0.png' },
            { name: 'Game B', img: 'https://cdn.discordapp.com/embed/avatars/1.png' },
            { name: 'Game C', img: 'https://cdn.discordapp.com/embed/avatars/2.png' },
            { name: 'Game D', img: 'https://cdn.discordapp.com/embed/avatars/3.png' },
            { name: 'Game E', img: 'https://cdn.discordapp.com/embed/avatars/4.png' },
            { name: 'Game F', img: 'https://cdn.discordapp.com/embed/avatars/5.png' },
            { name: 'Game G', img: 'https://cdn.discordapp.com/embed/avatars/0.png' },
            { name: 'Game H', img: 'https://cdn.discordapp.com/embed/avatars/1.png' },
            { name: 'Game I', img: 'https://cdn.discordapp.com/embed/avatars/2.png' },
            { name: 'Game J', img: 'https://cdn.discordapp.com/embed/avatars/3.png' },
            { name: 'Game K', img: 'https://cdn.discordapp.com/embed/avatars/4.png' },
            { name: 'Game L', img: 'https://cdn.discordapp.com/embed/avatars/5.png' },
            { name: 'Game M', img: 'https://cdn.discordapp.com/embed/avatars/0.png' },
            { name: 'Game N', img: 'https://cdn.discordapp.com/embed/avatars/1.png' },
            { name: 'Game O', img: 'https://cdn.discordapp.com/embed/avatars/2.png' },
            { name: 'Game P', img: 'https://cdn.discordapp.com/embed/avatars/3.png' },
            { name: 'Game Q', img: 'https://cdn.discordapp.com/embed/avatars/4.png' },
            { name: 'Game R', img: 'https://cdn.discordapp.com/embed/avatars/5.png' },
            { name: 'Game S', img: 'https://cdn.discordapp.com/embed/avatars/0.png' },
            { name: 'Game T', img: 'https://cdn.discordapp.com/embed/avatars/1.png' },
            { name: 'Game U', img: 'https://cdn.discordapp.com/embed/avatars/2.png' },
            { name: 'Game V', img: 'https://cdn.discordapp.com/embed/avatars/3.png' },
        ],
        totalUnlockedAchievements: 1000
    },
    {
        user: mockUsers[3],
        completedGames: [
            { name: 'Game A', img: 'https://cdn.discordapp.com/embed/avatars/0.png' },
            { name: 'Game B', img: 'https://cdn.discordapp.com/embed/avatars/1.png' },
            { name: 'Game C', img: 'https://cdn.discordapp.com/embed/avatars/2.png' },
            { name: 'Game D', img: 'https://cdn.discordapp.com/embed/avatars/3.png' },
            { name: 'Game E', img: 'https://cdn.discordapp.com/embed/avatars/4.png' },
            { name: 'Game F', img: 'https://cdn.discordapp.com/embed/avatars/5.png' },
            { name: 'Game G', img: 'https://cdn.discordapp.com/embed/avatars/0.png' },
            { name: 'Game H', img: 'https://cdn.discordapp.com/embed/avatars/1.png' },
            { name: 'Game I', img: 'https://cdn.discordapp.com/embed/avatars/2.png' },
            { name: 'Game J', img: 'https://cdn.discordapp.com/embed/avatars/3.png' },
            { name: 'Game K', img: 'https://cdn.discordapp.com/embed/avatars/4.png' },
            { name: 'Game L', img: 'https://cdn.discordapp.com/embed/avatars/5.png' },
            { name: 'Game M', img: 'https://cdn.discordapp.com/embed/avatars/0.png' },
            { name: 'Game N', img: 'https://cdn.discordapp.com/embed/avatars/1.png' },
            { name: 'Game O', img: 'https://cdn.discordapp.com/embed/avatars/2.png' },
            { name: 'Game P', img: 'https://cdn.discordapp.com/embed/avatars/3.png' },
            { name: 'Game Q', img: 'https://cdn.discordapp.com/embed/avatars/4.png' },
            { name: 'Game R', img: 'https://cdn.discordapp.com/embed/avatars/5.png' },
            { name: 'Game S', img: 'https://cdn.discordapp.com/embed/avatars/0.png' },
            { name: 'Game T', img: 'https://cdn.discordapp.com/embed/avatars/1.png' },
        ],
        totalUnlockedAchievements: 800
    },
    {
        user: mockUsers[4],
        completedGames: [
            { name: 'Game A', img: 'https://cdn.discordapp.com/embed/avatars/0.png' },
            { name: 'Game B', img: 'https://cdn.discordapp.com/embed/avatars/1.png' },
            { name: 'Game C', img: 'https://cdn.discordapp.com/embed/avatars/2.png' },
            { name: 'Game D', img: 'https://cdn.discordapp.com/embed/avatars/3.png' },
            { name: 'Game E', img: 'https://cdn.discordapp.com/embed/avatars/4.png' },
            { name: 'Game F', img: 'https://cdn.discordapp.com/embed/avatars/5.png' },
            { name: 'Game G', img: 'https://cdn.discordapp.com/embed/avatars/0.png' },
            { name: 'Game H', img: 'https://cdn.discordapp.com/embed/avatars/1.png' },
            { name: 'Game I', img: 'https://cdn.discordapp.com/embed/avatars/2.png' },
            { name: 'Game J', img: 'https://cdn.discordapp.com/embed/avatars/3.png' },
            { name: 'Game K', img: 'https://cdn.discordapp.com/embed/avatars/4.png' },
            { name: 'Game L', img: 'https://cdn.discordapp.com/embed/avatars/5.png' },
            { name: 'Game M', img: 'https://cdn.discordapp.com/embed/avatars/0.png' },
            { name: 'Game N', img: 'https://cdn.discordapp.com/embed/avatars/1.png' },
            { name: 'Game O', img: 'https://cdn.discordapp.com/embed/avatars/2.png' },
            { name: 'Game P', img: 'https://cdn.discordapp.com/embed/avatars/3.png' },
            { name: 'Game Q', img: 'https://cdn.discordapp.com/embed/avatars/4.png' },
            { name: 'Game R', img: 'https://cdn.discordapp.com/embed/avatars/5.png' },
        ],
        totalUnlockedAchievements: 600
    },
];

const mockInteraction = {
    editReply: async ({ embeds, files, components }) => {
        console.log('--- Mock interaction.editReply called ---');
        if (embeds && embeds.length > 0) {
            console.log('Embed Title:', embeds[0].data.title);
        }
        if (files && files.length > 0) {
            console.log('Files:', files.length, 'attachment(s)');
            const buffer = files[0].attachment;
            writeFileSync('test_leaderboard_output.png', buffer);
            console.log('Leaderboard image saved to test_leaderboard_output.png');
        }
        if (components && components.length > 0) {
            console.log('Components:', components[0].components.map(c => c.custom_id));
        }
    },
    client: {
        data: {
            users: mockUsers // Provide mockUsers for the client.data.users
        }
    },
    guildId: '1234567890123456789', // Mock guildId
    createMessageComponentCollector: ({ time }) => {
        console.log(`Mock collector created with time: ${time}`);
        return {
            on: (event, callback) => {
                console.log(`Mock collector listening for event: ${event}`);
                // Simulate a 'collect' event for testing pagination if needed
                // For now, we'll just log that it's listening
            }
        };
    }
};

// Run the test
(async () => {
    console.log('Running test for displayLeaderboard...');
    await displayLeaderboard(mockInteraction, mockLeaderboardData);
    console.log('Test finished.');
})();