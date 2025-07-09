const { AttachmentBuilder, EmbedBuilder, ActionRowBuilder } = require('discord.js');
const { ASSETS_PATH } = require('../utils/paths').default;
const path = require('path');
const { backButton, forwardButton } = require(path.join(ASSETS_PATH, 'buttons.js'));
const { printAtWordWrap } = require(path.join(ASSETS_PATH, 'utils.js'))
const Canvas = require('canvas');
require('chartjs-adapter-moment')
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const gifs = [
    "https://tenor.com/view/good-job-clapping-obama-gif-12414317449568226158",
    "https://tenor.com/view/leonardo-dicaprio-clapping-clap-applause-amazing-gif-16078907558888063471",
    "https://tenor.com/view/congrats-fireworks-gif-6260073604780267354",
    "https://tenor.com/view/toast-fireworks-celebration-leonardo-di-caprio-cheers-gif-15086880",
    "https://tenor.com/view/confetti-style-gif-19616552",
    "https://tenor.com/view/mrandmissjackson-ariana-grande-michael-jackson-gif-20951576"
];

function calculateWordWrapLines(context, text, maxWidth) {
    if (!text) return 1;
    const words = text.split(' ');
    let line = '';
    let lineCount = 1;

    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && i > 0) {
            lineCount++;
            line = words[i] + ' ';
        } else {
            line = testLine;
        }
    }
    return lineCount;
}

async function displayNewAchievementImage(achievement, game, users, guild, unlockingUser, position) {
    try {
        Canvas.registerFont(path.join(ASSETS_PATH, 'OpenSans-VariableFont_wdth,wght.ttf'), { family: 'Open Sans Regular' });

        const players = Object.keys(achievement.playersUnlockTime);
        const guildPlayersWhoUnlocked = users.filter(u =>
            players.includes(u.steam_id) &&
            achievement.playersUnlockTime[u.steam_id] != 0 &&
            u.guilds.includes(guild.id)
        );

        guildPlayersWhoUnlocked.sort((a, b) => {
            return achievement.playersUnlockTime[a.steam_id] - achievement.playersUnlockTime[b.steam_id];
        });

        const totalAvatars = guildPlayersWhoUnlocked.length;
        const avatarsPerLine = 10;
        const lineConfig = [];
        if (totalAvatars > 0) {
            let remaining = totalAvatars;
            while (remaining > 0) {
                const lineCount = Math.min(remaining, avatarsPerLine);
                lineConfig.push(lineCount);
                remaining -= lineCount;
            }
        }
        const avatarRows = lineConfig.length;

        // --- Calculate dynamic height based on description length ---
        const tempCanvas = Canvas.createCanvas(1, 1); // Dummy canvas for context
        const tempContext = tempCanvas.getContext('2d');
        const descriptionFont = '20px "Open Sans Regular"';
        const descriptionLineHeight = 22;
        const descriptionMaxWidth = 525;
        tempContext.font = descriptionFont;
        const descriptionLines = calculateWordWrapLines(tempContext, achievement.achievementDescription, descriptionMaxWidth);

        const topSectionHeight = 115; // Base height for icon, title, etc. before description
        const descriptionHeight = descriptionLines * descriptionLineHeight;
        const socialSectionBaseY = topSectionHeight + descriptionHeight;
        const avatarsHeight = (avatarRows > 0) ? (60 + ((avatarRows - 1) * 40)) : 40; // 60 for "already unlocked by" + padding, then 40 per row

        const canvasHeight = socialSectionBaseY + avatarsHeight;

        const canvas = Canvas.createCanvas(700, canvasHeight);
        const context = canvas.getContext('2d');

        // Load images
        await Promise.all([
            Canvas.loadImage(path.join(ASSETS_PATH, 'background.jpg')).then(img => {
                context.drawImage(img, 0, 0, canvas.width, canvas.height);
            }).catch(err => console.error("Error loading background image:", err)),
            Canvas.loadImage(achievement.icon).then(img => {
                context.drawImage(img, 25, 25, 100, 100);
            }).catch(err => console.error("Error loading icon image:", err))
        ]);

        // --- Achievement Info Section (Top) ---
        const textX = 145;

        // Game Name
        context.font = '20px "Open Sans Regular"';
        context.fillStyle = '#bfbfbf';
        context.fillText(game.realName, textX, 45);

        // Achievement Name
        context.font = '30px "Open Sans Regular"';
        context.fillStyle = '#ffffff';
        context.fillText(achievement.achievementName, textX, 75);

        // Achievement Description
        context.font = descriptionFont;
        context.fillStyle = '#bfbfbf';
        printAtWordWrap(context, achievement.achievementDescription, textX, 105, descriptionLineHeight, descriptionMaxWidth);

        // --- Social Section (Bottom) ---
        const socialY = socialSectionBaseY;

        // Rarity (Global Percentage)
        context.font = '22px "Open Sans Regular"';
        context.fillStyle = '#ffffff';
        context.fillText("Rarity:", 25, socialY);
        context.fillStyle = '#67d4f4';
        context.fillText(`${(achievement.globalPercentage ?? 0)}% of players`, 25, socialY + 25);


        // Players who unlocked
        context.font = '22px "Open Sans Regular"';
        context.fillStyle = '#ffffff';
        const unlockedByX = 280;
        context.fillText("Already unlocked by:", unlockedByX, socialY);

        const avatarSize = 32;
        const avatarSpacing = 40;
        const initialAvatarY = socialY + 10;
        const avatarLineSpacing = 40;

        let avatarIndex = 0;
        for (let lineIndex = 0; lineIndex < avatarRows; lineIndex++) {
            const avatarsOnThisLine = lineConfig[lineIndex];
            for (let indexOnLine = 0; indexOnLine < avatarsOnThisLine; indexOnLine++) {
                const player = guildPlayersWhoUnlocked[avatarIndex];
                if (!player) continue;

                const x = unlockedByX + avatarSpacing * indexOnLine;
                const y = initialAvatarY + lineIndex * avatarLineSpacing;

                // Draw avatar
                context.drawImage(player.avatar, x, y, avatarSize, avatarSize);
                avatarIndex++;
            }
        }

        const attachment = new AttachmentBuilder(canvas.toBuffer());
        const unlock_order = game.nbUnlocked[unlockingUser.steam_id] - position;
        const unlock_rate = unlock_order / game.nbTotal * 100;
        const game_finished = unlock_order === game.nbTotal;
        await guild.channel.send({ content: `${game_finished ? '🎉' : ''} <@${unlockingUser.discord_id}> unlocked an achievement on ${game.realName}. Progress : (${unlock_order}/${game.nbTotal}) [${unlock_rate.toFixed(2)}%] ${game_finished ? '🎉' : ''}`, files: [attachment] });
        if (game_finished) {
            guild.channel.send(gifs[Math.floor(Math.random() * gifs.length)]);
        }
    }
    catch (err) {
        console.error(`Error displaying new achievement for ${unlockingUser.nickname} (${unlockingUser.steam_id}) in game ${game.realName}:`, err);
    }
}

async function displayAchievementsHistory(interaction, all_timestamps, datasets, realName) {
    delete require.cache[require.resolve('chartjs-adapter-moment')]
    require('chartjs-adapter-moment')

    const width = 700; //px
    const height = 500; //px
    const backgroundColour = '#11181f';
    const chart = new ChartJSNodeCanvas({ width, height, backgroundColour });

    const configuration = {
        type: "line",
        data: {
            labels: all_timestamps,
            datasets: datasets.map(dataset => ({
                ...dataset,
                borderWidth: 3
            }))
        },
        options: {
            layout: {
                padding: {
                    right: 20
                }
            },
            scales: {
                x: {
                    type: 'time',
                    title: {
                        display: true,
                        text: 'Date',
                        color: '#FFFFFF',
                        font: {
                            size: 16
                        }
                    },
                    ticks: {
                        color: '#afb0b7'
                    },
                    grid: {
                        display: true,
                        drawOnChartArea: true,
                        drawTicks: true,
                        color: "#303131"
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Number of achievements unlocked',
                        color: '#FFFFFF',
                        font: {
                            size: 16
                        }
                    },
                    ticks: {
                        color: '#afb0b7'
                    },
                    grid: {
                        display: true,
                        drawOnChartArea: true,
                        drawTicks: true,
                        color: "#303131"
                    }
                }
            },
            elements: {
                point: {
                    radius: 0
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `History on ${realName}`,
                    color: "#FFFFFF",
                    font: {
                        size: 20
                    }
                },
                legend: {
                    labels: {
                        color: "#FFFFFF",
                        font: {
                            size: 16
                        },
                        usePointStyle: true,
                        pointStyle: 'line',
                        padding: 20,
                    }
                }
            }
        }
    };
    const image = await chart.renderToBuffer(configuration);

    const attachment = new AttachmentBuilder(image);
    await interaction.editReply({ files: [attachment] });

}
async function displayProgressionBar(interaction, gameObject) {
    try {
        const usersData = interaction.client.data.users.filter(user => user.guilds.includes(interaction.guildId));
        let background;
        let black_bar;
        let blue_bar;
        let grey_bar;
        [background, blue_bar, black_bar, grey_bar] = await Promise.all([
            Canvas.loadImage(path.join(ASSETS_PATH, 'background.jpg')),
            Canvas.loadImage(path.join(ASSETS_PATH, 'blue_progress_bar.png')),
            Canvas.loadImage(path.join(ASSETS_PATH, 'black_progress_bar.png')),
            Canvas.loadImage(path.join(ASSETS_PATH, 'grey_progress_bar.png'))
        ])

        let users_nb_unlocked_not_null = Object.entries(gameObject.nbUnlocked).filter(([k, v]) => {
            const user = usersData.find(u => u.steam_id === k);
            return v !== 0
        });
        Canvas.registerFont(path.join(ASSETS_PATH, 'OpenSans-VariableFont_wdth,wght.ttf'), { family: 'Open Sans Regular' })
        const canvas = Canvas.createCanvas(700, 115 + (users_nb_unlocked_not_null.length - 1) * 70);
        const context = canvas.getContext('2d');
        var attachment;
        context.drawImage(background, 0, 0);

        let sorted = [];
        for (let [k, v] of users_nb_unlocked_not_null) {
            const user = usersData.find(u => u.steam_id === k);
            if (user) {
                sorted.push([user, v]);
            }
        }
        sorted.sort(function (a, b) {
            return b[1] - a[1]
        });

        users_nb_unlocked_not_null = sorted

        const name_display = gameObject.realName === '' ? gameObject.name : gameObject.realName

        users_nb_unlocked_not_null.forEach((u) => {
            const ownedGame = u[0].ownedGames.find(gameIdInArray => gameIdInArray === gameObject.id);
            if (!ownedGame) {
                console.warn(`Game ${gameObject.id} not found in ownedGames for user ${u[0].nickname}`);
                u[0].playtimeForCurrentGame = 0; // Fallback
            } else {
                u[0].playtimeForCurrentGame = gameObject.playtime[u[0].steam_id];
            }
        })

        if (users_nb_unlocked_not_null.length > 0) {
            var n = 0;

            context.font = '25px "Open Sans Regular"';
            context.fillStyle = '#ffffff';
            context.fillText("Progress on " + name_display, 25, 35);

            const tps_max = Math.max(...users_nb_unlocked_not_null.map(u => u[0].playtimeForCurrentGame));

            const barLength = 480

            users_nb_unlocked_not_null.forEach((v) => {
                context.drawImage(v[0].avatar, 25, 48 + n * 70, 50, 50);
                context.font = '15px "Open Sans Regular"';
                context.fillStyle = '#bfbfbf';
                context.fillText(`${v[1]}/${gameObject.nbTotal} (${parseInt(100 * v[1] / gameObject.nbTotal)}%)`, 100 + barLength + 10, 71 + n * 70);
                context.drawImage(black_bar, 100, 58 + n * 70, barLength, 15);
                context.drawImage(blue_bar, 100, 58 + n * 70, barLength * v[1] / gameObject.nbTotal, 15);
                context.fillText(`${(v[0].playtimeForCurrentGame / 60).toFixed(1)} h`, 100 + barLength + 10, 91 + n * 70);
                context.drawImage(black_bar, 100, 78 + n * 70, barLength, 15);
                context.drawImage(grey_bar, 100, 78 + n * 70, barLength * v[0].playtimeForCurrentGame / tps_max, 15)
                n += 1;
            })
            attachment = new AttachmentBuilder(canvas.toBuffer())
            await interaction.editReply({ files: [attachment] });
            return
        }
        await interaction.editReply(`Nobody has achievement on ${name_display}`);
    } catch (err) {
        console.error(`displayProgressionBar error for ${gameObject.id}:`, err);
    }
}
async function displayAchievementsList(achievements_locked, interaction, canvas_title) {
    const MAX_PAGE = 5
    const background = await Canvas.loadImage(path.join(ASSETS_PATH, 'background.jpg'))
    if (achievements_locked.length === 0) {
        return
    }

    achievements_locked.sort(function (a, b) {
        return parseFloat(b.object.globalPercentage) - parseFloat(a.object.globalPercentage)
    })

    async function get_embedded_img(achievements_fraction, startAnb, endAnb) {
        const SPACE_BETWEEN = 90
        const canvas = Canvas.createCanvas(700, 135 + (achievements_fraction.length - 1) * SPACE_BETWEEN);
        const context = canvas.getContext('2d');
        context.drawImage(background, 0, 0);
        context.font = '22px "Open Sans Regular"';
        context.fillStyle = '#ffffff';

        context.fillText(`${canvas_title[0]} ${startAnb}-${endAnb} out of ${achievements_locked.length} `, 20, 35);
        // var n = 0;

        await Promise.all(achievements_fraction.map(async (a, n) => {
            const icon = await Canvas.loadImage(a.object.icon)
            context.drawImage(icon, 20, 53 + n * SPACE_BETWEEN, 60, 60);

            context.font = '20px "Open Sans Regular"';
            context.fillStyle = '#67d4f4';
            context.fillText(a.object.achievementName, 100, 68 + n * SPACE_BETWEEN) //TITRE
            // context.fillText("Unlocked by ", 100+context.measureText(a[1][2]).width+10, 68+n*SPACE_BETWEEN);
            context.fillStyle = '#bfbfbf';

            const title_width = context.measureText(a.object.achievementName).width
            context.fillText(`(${a.object.globalPercentage}%)`, 100 + title_width + 10, 68 + n * SPACE_BETWEEN)
            const globalPercentage_width = context.measureText(`(${a.object.globalPercentage}%)`).width

            a.playersWhoUnlocked.map(async (user_a, index) => {
                context.drawImage(user_a.avatar, 100 + title_width + globalPercentage_width + 20 + 40 * index, 46 + n * SPACE_BETWEEN, 30, 30);
            })
            // context.fillText(txt, 100 + title_width + 10 + 40 * index, 68 + n * SPACE_BETWEEN);


            printAtWordWrap(context, a.object.achievementDescription, 100, 96 + n * SPACE_BETWEEN, 20, 580)
            // context.fillText(, 100, 96+n*70);
        }))
        return new AttachmentBuilder(canvas.toBuffer(), 'img_part2.png')
    }

    const canFitOnOnePage = achievements_locked.length <= MAX_PAGE
    const slice_achievements = achievements_locked.slice(0, 0 + 5)
    const img_first = await get_embedded_img(slice_achievements, 1, slice_achievements.length)
    const embedMessage = await interaction.editReply({
        embeds: [new EmbedBuilder().setTitle(`Showing ${canvas_title[1]} achievements ${1} -${slice_achievements.length} out of ${achievements_locked.length}`)],
        files: [img_first],
        components: canFitOnOnePage
            ? []
            : [new ActionRowBuilder({ components: [forwardButton] })]
    })
    // Exit if there is only one page of guilds (no need for all of this)
    if (canFitOnOnePage) return

    // Collect button interactions (when a user clicks a button)
    const collector = embedMessage.createMessageComponentCollector({ time: 172800000 })

    let currentIndex = 0
    collector.on('collect', async interaction => {
        // Increase/decrease index
        interaction.customId === backButton.data.custom_id ? (currentIndex = currentIndex - MAX_PAGE) : (currentIndex = currentIndex + MAX_PAGE)
        // Respond to interaction by updating message with new embed
        const slice_achievements = achievements_locked.slice(currentIndex, currentIndex + 5)
        const img = await get_embedded_img(slice_achievements, currentIndex + 1, currentIndex + slice_achievements.length)

        await interaction.update({
            embeds: [new EmbedBuilder().setTitle(`Showing ${canvas_title[1]} achievements ${currentIndex + 1}-${currentIndex + slice_achievements.length} out of ${achievements_locked.length}`)],
            files: [img],
            components: [
                new ActionRowBuilder({
                    components: [
                        // back button if it isn't the start
                        ...(currentIndex ? [backButton] : []),
                        // forward button if it isn't the end
                        ...(currentIndex + MAX_PAGE < achievements_locked.length ? [forwardButton] : [])
                    ]
                })
            ]
        })
    })
}

async function displayLeaderboard(interaction, leaderboardData) {
    const MAX_PLAYERS_PER_PAGE = 5;
    const background = await Canvas.loadImage(path.join(ASSETS_PATH, 'background.jpg'));
    async function get_leaderboard_image(players_fraction, startRank) {
        Canvas.registerFont(path.join(ASSETS_PATH, 'OpenSans-VariableFont_wdth,wght.ttf'), { family: 'Open Sans Regular' });

        const avatarHeight = 50;
        const avatarYPadding = 25;
        const iconSize = 20;
        const iconXOffset = 30; // Space between icons
        const gamesPerLine = 16; // Max icons per line
        const lineSpacing = 10; // Vertical space between lines of icons
        const playerEntryPadding = 20; // Padding between the bottom of one player's content and the next player's avatar

        let calculatedTotalHeight = 48; // For title and initial padding
        let usersYPositions = []; // Y position for the top of the current player's avatar
        usersYPositions.push(calculatedTotalHeight); // Start with the first player's position
        for (let i = 0; i < players_fraction.length; i++) {
            const entry = players_fraction[i];
            if (i !== 0) {
                usersYPositions.push(calculatedTotalHeight);
            }
            const numberOfCompletedGames = entry.completedGames.length;
            if (numberOfCompletedGames > gamesPerLine) {
                const numLinesOfGames = Math.ceil(numberOfCompletedGames / gamesPerLine);
                calculatedTotalHeight += avatarYPadding + (numLinesOfGames * (iconSize + lineSpacing));
            }
            else {
                calculatedTotalHeight += avatarHeight;
            }
            calculatedTotalHeight += playerEntryPadding;
        }

        const canvas = Canvas.createCanvas(700, calculatedTotalHeight);
        const context = canvas.getContext('2d');

        context.drawImage(background, 0, 0, canvas.width, canvas.height);

        context.font = '25px "Open Sans Regular"';
        context.fillStyle = '#ffffff';
        context.fillText('Leaderboard - Games Completed', 25, 35);

        for (let i = 0; i < players_fraction.length; i++) {
            let currentYPosition = usersYPositions[i];
            const entry = players_fraction[i];
            const user = entry.user;
            const numberOfCompletedGames = entry.completedGames.length;

            // Rank
            context.font = '15px "Open Sans Regular"';
            context.fillStyle = '#ffffff';
            context.fillText(`#${startRank + i}`, 25, currentYPosition + (avatarHeight / 2)); // Centered vertically with avatar

            // Avatar
            context.drawImage(user.avatar, 60, currentYPosition, avatarHeight, avatarHeight);

            // Nickname
            context.font = '20px "Open Sans Regular"';
            context.fillStyle = '#ffffff';
            context.fillText(user.nickname, 130, currentYPosition + 16); // Centered vertically with avatar

            // Completed Games Count
            context.font = '15px "Open Sans Regular"';
            context.fillStyle = '#ffffff';
            context.textAlign = 'right';
            context.fillText(`${numberOfCompletedGames} games`, canvas.width - 25, currentYPosition + 16);
            context.textAlign = 'left';

            // Games completed icons
            let iconCurrentX = 130;
            let iconCurrentY = currentYPosition + avatarYPadding; // Start below avatar block 

            // Add a cache for loaded images to avoid redundant loads
            const imageCache = {};

            for (let j = 0; j < entry.completedGames.length; j++) {
                const game = entry.completedGames[j];
                if (j > 0 && j % gamesPerLine === 0) {
                    // New line of icons
                    iconCurrentX = 130;
                    iconCurrentY += iconSize + lineSpacing;
                }

                try {
                    // Log the URL being loaded
                    // Load image from URL if not already loaded
                    if (game.img) {
                        let imgObj;
                        if (imageCache[game.img]) {
                            imgObj = imageCache[game.img];
                        } else {
                            imgObj = await Canvas.loadImage(game.img);
                            imageCache[game.img] = imgObj;
                        }
                        context.drawImage(imgObj, iconCurrentX, iconCurrentY, iconSize, iconSize);
                    }


                } catch (err) {
                    console.warn(`Error loading game icon for user ${user.nickname}, game ${game.name}, url ${game.img}:`, err);
                    // Optionally, draw a placeholder or skip
                }
                iconCurrentX += iconXOffset;
            }
        }

        return new AttachmentBuilder(canvas.toBuffer(), 'leaderboard.png');
    }

    const canFitOnOnePage = leaderboardData.length <= MAX_PLAYERS_PER_PAGE;
    const slice_players = leaderboardData.slice(0, MAX_PLAYERS_PER_PAGE);
    const img_first = await get_leaderboard_image(slice_players, 1);

    const embedMessage = await interaction.editReply({
        embeds: [new EmbedBuilder().setTitle(`Leaderboard - Showing players ${1}-${slice_players.length} out of ${leaderboardData.length}`)],
        files: [img_first],
        components: canFitOnOnePage
            ? []
            : [new ActionRowBuilder({ components: [forwardButton] })]
    });

    if (canFitOnOnePage) {
        return;
    }

    const collector = embedMessage.createMessageComponentCollector({ time: 172800000 });

    let currentIndex = 0;
    collector.on('collect', async interaction => {
        interaction.customId === backButton.data.custom_id ? (currentIndex = currentIndex - MAX_PLAYERS_PER_PAGE) : (currentIndex = currentIndex + MAX_PLAYERS_PER_PAGE);

        const slice_players = leaderboardData.slice(currentIndex, currentIndex + MAX_PLAYERS_PER_PAGE);
        const img = await get_leaderboard_image(slice_players, currentIndex + 1);

        await interaction.update({
            embeds: [new EmbedBuilder().setTitle(`Leaderboard - Showing players ${currentIndex + 1}-${currentIndex + slice_players.length} out of ${leaderboardData.length}`)],
            files: [img],
            components: [
                new ActionRowBuilder({
                    components: [
                        ...(currentIndex ? [backButton] : []),
                        ...(currentIndex + MAX_PLAYERS_PER_PAGE < leaderboardData.length ? [forwardButton] : [])
                    ]
                })
            ]
        });
    });
}


module.exports = {
    displayAchievementsHistory,
    displayProgressionBar,
    displayAchievementsList,
    displayNewAchievementImage,
    displayLeaderboard
};