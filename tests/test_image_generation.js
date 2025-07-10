import { displayNewAchievementImage } from '../src/discord/image_generation.cjs';
import { writeFileSync } from 'fs';
import { loadImage } from "canvas";

// Mock data for testing
const mockAchievement = {
    achievementName: 'Master of the Elements',
    achievementDescription: 'Successfusslly combine all elemental powers to defeat the final boss and restore balance to the world.',
    icon: 'https://cdn.discordapp.com/embed/avatars/0.png',
    globalPercentage: 5,
    playersUnlockTime: {
        '76561198000000001': 1678886400,
        '76561198000000002': 1678886400,
        '76561198000000003': 16788864,
        '76561198000000004': 16788864,
        '76561198000000005': 16788864,
        '76561198000000006': 0,
        '76561198000000007': 0,
        '76561198000000008': 0,
        '76561198000000009': 1678886400,
        '76561198000000010': 1678886400,
        '76561198000000011': 0,
        '76561198000000012': 0,
        '76561198000000013': 0,
        '76561198000000014': 0,
        '76561198000000015': 0,
        '76561198000000016': 0,
        '76561198000000017': 0,
        '76561198000000018': 0,
        '76561198000000019': 1678886400,
        '76561198000000020': 1678886400,
        '76561198000000021': 1678886400,
        '76561198000000022': 1678886400,
        '76561198000000023': 1678886400
    }
};

const mockGame = {
    realName: 'Elemental Quest',
    nbTotal: 100,
    nbUnlocked: {
        '76561198000000001': 50
    }
};

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
        avatar: await loadImage('https://cdn.discordapp.com/embed/avatars/0.png'),
        guilds: ['1234567890123456789']
    },
    {
        steam_id: '76561198000000003',
        discord_id: '345678901234567890',
        nickname: 'PlayerThree',
        avatar: await loadImage('https://cdn.discordapp.com/embed/avatars/0.png'),
        guilds: ['1234567890123456789']
    },
    {
        steam_id: '76561198000000004',
        discord_id: '456789012345678901',
        nickname: 'PlayerFour',
        avatar: await loadImage('https://cdn.discordapp.com/embed/avatars/1.png'),
        guilds: ['1234567890123456789']
    },
    {
        steam_id: '76561198000000005',
        discord_id: '567890123456789012',
        nickname: 'PlayerFive',
        avatar: await loadImage('https://cdn.discordapp.com/embed/avatars/2.png'),
        guilds: ['1234567890123456789']
    },
    {
        steam_id: '76561198000000006',
        discord_id: '678901234567890123',
        nickname: 'PlayerSix',
        avatar: await loadImage('https://cdn.discordapp.com/embed/avatars/3.png'),
        guilds: ['1234567890123456789']
    },
    {
        steam_id: '76561198000000007',
        discord_id: '789012345678901234',
        nickname: 'PlayerSeven',
        avatar: await loadImage('https://cdn.discordapp.com/embed/avatars/4.png'),
        guilds: ['1234567890123456789']
    },
    {
        steam_id: '76561198000000008',
        discord_id: '890123456789012345',
        nickname: 'PlayerEight',
        avatar: await loadImage('https://cdn.discordapp.com/embed/avatars/5.png'),
        guilds: ['1234567890123456789']
    },
    {
        steam_id: '76561198000000009',
        discord_id: '901234567890123456',
        nickname: 'PlayerNine',
        avatar: await loadImage('https://cdn.discordapp.com/embed/avatars/0.png'),
        guilds: ['1234567890123456789']
    },
    {
        steam_id: '76561198000000010',
        discord_id: '012345678901234567',
        nickname: 'PlayerTen',
        avatar: await loadImage('https://cdn.discordapp.com/embed/avatars/1.png'),
        guilds: ['1234567890123456789']
    },
    {
        steam_id: '76561198000000011',
        discord_id: '112345678901234567',
        nickname: 'PlayerEleven',
        avatar: await loadImage('https://cdn.discordapp.com/embed/avatars/2.png'),
        guilds: ['1234567890123456789']
    },
    {
        steam_id: '76561198000000012',
        discord_id: '122345678901234567',
        nickname: 'PlayerTwelve',
        avatar: await loadImage('https://cdn.discordapp.com/embed/avatars/3.png'),
        guilds: ['1234567890123456789']
    },
    {
        steam_id: '76561198000000013',
        discord_id: '132345678901234567',
        nickname: 'PlayerThirteen',
        avatar: await loadImage('https://cdn.discordapp.com/embed/avatars/4.png'),
        guilds: ['1234567890123456789']
    },
    {
        steam_id: '76561198000000014',
        discord_id: '142345678901234567',
        nickname: 'PlayerFourteen',
        avatar: await loadImage('https://cdn.discordapp.com/embed/avatars/5.png'),
        guilds: ['1234567890123456789']
    },
    {
        steam_id: '76561198000000015',
        discord_id: '152345678901234567',
        nickname: 'PlayerFifteen',
        avatar: await loadImage('https://cdn.discordapp.com/embed/avatars/0.png'),
        guilds: ['1234567890123456789']
    },
    {
        steam_id: '76561198000000016',
        discord_id: '162345678901234567',
        nickname: 'PlayerSixteen',
        avatar: await loadImage('https://cdn.discordapp.com/embed/avatars/1.png'),
        guilds: ['1234567890123456789']
    },
    {
        steam_id: '76561198000000017',
        discord_id: '172345678901234567',
        nickname: 'PlayerSeventeen',
        avatar: await loadImage('https://cdn.discordapp.com/embed/avatars/2.png'),
        guilds: ['1234567890123456789']
    },
    {
        steam_id: '76561198000000018',
        discord_id: '182345678901234567',
        nickname: 'PlayerEighteen',
        avatar: await loadImage('https://cdn.discordapp.com/embed/avatars/3.png'),
        guilds: ['1234567890123456789']
    },
    {
        steam_id: '76561198000000019',
        discord_id: '192345678901234567',
        nickname: 'PlayerNineteen',
        avatar: await loadImage('https://cdn.discordapp.com/embed/avatars/4.png'),
        guilds: ['1234567890123456789']
    },
    {
        steam_id: '76561198000000020',
        discord_id: '202345678901234567',
        nickname: 'PlayerTwenty',
        avatar: await loadImage('https://cdn.discordapp.com/embed/avatars/5.png'),
        guilds: ['1234567890123456789']
    },
    {
        steam_id: '76561198000000021',
        discord_id: '212345678901234567',
        nickname: 'PlayerTwentyOne',
        avatar: await loadImage('https://cdn.discordapp.com/embed/avatars/0.png'),
        guilds: ['1234567890123456789']
    },
    {
        steam_id: '76561198000000022',
        discord_id: '222345678901234567',
        nickname: 'PlayerTwentyTwo',
        avatar: await loadImage('https://cdn.discordapp.com/embed/avatars/1.png'),
        guilds: ['1234567890123456789']
    },
    {
        steam_id: '76561198000000023',
        discord_id: '232345678901234567',
        nickname: 'PlayerTwentyThree',
        avatar: await loadImage('https://cdn.discordapp.com/embed/avatars/2.png'),
        guilds: ['1234567890123456789']
    }
];

const mockGuild = {
    id: '1234567890123456789',
    channel: {
        send: ({ content, files }) => {
            console.log('--- Mock guild.channel.send called ---');
            console.log('Content:', content);
            console.log('Files:', files.length, 'attachment(s)');
            // In a real test, you might inspect the attachment further
            // For this script, we'll save the buffer to a file to check it visually
            const buffer = files[0].attachment;
            writeFileSync('test_output.png', buffer);
            console.log('Image saved to test_output.png');
        }
    }
};

const mockUnlockingUser = mockUsers[0];
const mockPosition = 0;

// Run the test
(async () => {
    console.log('Running test for displayNewAchievementImage...');
    await displayNewAchievementImage(
        mockAchievement,
        mockGame,
        mockUsers,
        mockGuild,
        mockUnlockingUser,
        mockPosition
    );
    console.log('Test finished.');
})();
