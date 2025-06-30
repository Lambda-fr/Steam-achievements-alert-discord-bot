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

async function displayNewAchievementImage(achievement, users, guild, author, position) {
    try {
        Canvas.registerFont(path.join(ASSETS_PATH, 'OpenSans-VariableFont_wdth,wght.ttf'), { family: 'Open Sans Regular' })
        const canvas = Canvas.createCanvas(700, 190);
        const context = canvas.getContext('2d');
        var attachment;
        await Promise.all([
            Canvas.loadImage(path.join(ASSETS_PATH, 'background.jpg'))
                .then(img => {
                    context.drawImage(img, 0, 0);
                })
                .catch(err => {
                    console.error("Error loading background image:", err);
                }),
            Canvas.loadImage(achievement.icon)
                .then(img => {
                    context.drawImage(img, 25, 25, 100, 100);
                })
                .catch(err => {
                    console.error("Error loading icon image:", err);
                })
        ])
        const decal = 160
        if (author.avatar) {
            context.drawImage(author.avatar, decal, 140, 32, 32);
        } else {
            console.warn("Missing author.avatar");
        }

        const players = Object.keys(achievement.playersUnlockTime);
        var playerObject;
        var index = 0;
        for (const player of players) {
            playerObject = users.find(u => u.steam_id === player)
            //if it's not the user who triggered the achievement, if he unlocked it, and if he's in the guild user list
            if (
                player != author.steam_id &&
                achievement.playersUnlockTime[player] != 0 &&
                playerObject &&
                playerObject.guilds.includes(guild.id)
            ) {
                if (playerObject.avatar) {
                    context.drawImage(playerObject.avatar, decal + 40 * (index + 1), 140, 32, 32);
                } else {
                    console.warn(`Missing avatar for player ${player}`);
                }
                index = index + 1;
            }
        }
        context.font = '30px "Open Sans Regular"';
        context.fillStyle = '#ffffff';
        context.fillText(achievement.achievementName, 150, 45);

        context.font = '20px "Open Sans Regular"';
        context.fillStyle = '#bfbfbf';
        printAtWordWrap(context, achievement.achievementDescription, 150, 72, 20, 525)

        context.font = '22px "Open Sans Regular"';
        context.fillStyle = '#ffffff';
        const txt2_1 = "Unlocked by ";
        const txt2_2 = "and by " + (achievement.globalPercentage ?? 0) + "% of players.";
        context.fillText(txt2_1, 25, 165);
        context.fillText(txt2_2, decal + (index + 1) * 40, 165);

        attachment = new AttachmentBuilder(canvas.toBuffer())
        const unlock_order = achievement.game.nbUnlocked[author.steam_id].nbUnlocked - position
        const unlock_rate = unlock_order / achievement.game.nbTotal * 100;
        const game_finished = unlock_order === achievement.game.nbTotal
        await guild.channel.send({ content: `${game_finished ? '🎉' : ''} <@${author.discord_id}> unlocked an achievement on ${achievement.game.realName}. Progress : (${unlock_order}/${achievement.game.nbTotal}) [${unlock_rate.toFixed(2)}%] ${game_finished ? '🎉' : ''}`, files: [attachment] })
        if (game_finished) {
            guild.channel.send(gifs[Math.floor(Math.random() * gifs.length)])
        }
    }
    catch (err) {
        console.error(`Error displaying new achievement for ${author.nickname} (${author.steam_id}) in game ${achievement.game.realName}:`, err);
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

    const attachment = new AttachmentBuilder(image)
    await interaction.deferReply()
    await interaction.editReply({ files: [attachment] })

}
async function displayProgressionBar(interaction, gameObject) {
    try {
        var background
        var black_bar
        var blue_bar
        var grey_bar
        [background, blue_bar, black_bar, grey_bar] = await Promise.all([
            Canvas.loadImage(path.join(ASSETS_PATH, 'background.jpg')),
            Canvas.loadImage(path.join(ASSETS_PATH, 'blue_progress_bar.png')),
            Canvas.loadImage(path.join(ASSETS_PATH, 'black_progress_bar.png')),
            Canvas.loadImage(path.join(ASSETS_PATH, 'grey_progress_bar.png'))
        ])

        var users_nb_unlocked_not_null = Object.entries(gameObject.nbUnlocked).filter(([k, v]) => v.nbUnlocked !== 0 && v.user.guilds.includes(interaction.guildId))
        Canvas.registerFont(path.join(ASSETS_PATH, 'OpenSans-VariableFont_wdth,wght.ttf'), { family: 'Open Sans Regular' })
        const canvas = Canvas.createCanvas(700, 115 + (users_nb_unlocked_not_null.length - 1) * 70);
        const context = canvas.getContext('2d');
        var attachment;
        context.drawImage(background, 0, 0);

        var sorted = [];
        for (var [k, v] of users_nb_unlocked_not_null) {
            sorted.push([v.user, v.nbUnlocked]);
        }
        sorted.sort(function (a, b) {
            return b[1] - a[1]
        })

        users_nb_unlocked_not_null = sorted

        const name_display = gameObject.realName === '' ? gameObject.name : gameObject.realName

        users_nb_unlocked_not_null.forEach((u) => {
            const ownedGame = u[0].ownedGames.find(game => String(game.id) === gameObject.id);
            if (!ownedGame) {
                console.warn(`Game ${gameObject.id} not found in ownedGames for user ${u[0].nickname}`);
                u[0].playtimeForCurrentGame = 0; // Fallback
            } else {
                u[0].playtimeForCurrentGame = ownedGame.playtime;
            }
        })

        await interaction.deferReply();
        if (users_nb_unlocked_not_null.length > 0) {
            var n = 0;

            context.font = '25px "Open Sans Regular"';
            context.fillStyle = '#ffffff';
            context.fillText("Progress on " + name_display, 25, 35);

            const tps_max = Math.max(...users_nb_unlocked_not_null.map(u => u[0].playtimeForCurrentGame));

            const barLength = 480

            users_nb_unlocked_not_null.forEach((v) => {
                context.drawImage(v[0].avatar, 25, 48 + n * 70, 50, 50);
                context.strokeStyle = v[0].color || '#ffffff'; // Use user's color if available
                context.lineWidth = 2;
                context.strokeRect(25, 48 + n * 70, 50, 50);
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
    const embedMessage = await interaction.channel.send({
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
    try {
        Canvas.registerFont(path.join(ASSETS_PATH, 'OpenSans-VariableFont_wdth,wght.ttf'), { family: 'Open Sans Regular' });
        const background = await Canvas.loadImage(path.join(ASSETS_PATH, 'background.jpg'));

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
        for (let i = 0; i < leaderboardData.length; i++) {
            const entry = leaderboardData[i];
            if (i !== 0) {
                usersYPositions.push(calculatedTotalHeight);
            }
            const numberOfCompletedGames = entry.completedGames.length;
            if (numberOfCompletedGames > gamesPerLine) {
                // If there are games, the bottom is determined by the last icon drawn
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



        for (let i = 0; i < leaderboardData.length; i++) {
            let currentYPosition = usersYPositions[i];
            const entry = leaderboardData[i];
            const user = entry.user;
            const numberOfCompletedGames = entry.completedGames.length;

            // Rank
            context.font = '15px "Open Sans Regular"';
            context.fillStyle = '#ffffff';
            context.fillText(`#${i + 1}`, 25, currentYPosition + (avatarHeight / 2)); // Centered vertically with avatar

            // Avatar
            if (user.avatar) {
                try {
                    context.drawImage(user.avatar, 60, currentYPosition, avatarHeight, avatarHeight);
                    context.strokeStyle = user.color || '#ffffff';
                    context.lineWidth = 2;
                    context.strokeRect(60, currentYPosition, avatarHeight, avatarHeight);
                } catch (err) {
                    console.warn(`Error loading avatar for user ${user.nickname}:`, err);
                }
            } else {
                console.warn(`Missing avatar URL for user ${user.nickname}`);
            }

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

            for (let j = 0; j < entry.completedGames.length; j++) {
                const game = entry.completedGames[j];
                if (j > 0 && j % gamesPerLine === 0) {
                    // New line of icons
                    iconCurrentX = 130;
                    iconCurrentY += iconSize + lineSpacing;
                }

                try {
                    const iconImage = await Canvas.loadImage(game.img);
                    context.drawImage(iconImage, iconCurrentX, iconCurrentY, iconSize, iconSize);
                } catch (err) {
                    console.warn(`Error loading game icon for user ${user.nickname}, game ${game.name}:`, err);
                }
                iconCurrentX += iconXOffset;
            }

        }

        const attachment = new AttachmentBuilder(canvas.toBuffer(), 'leaderboard.png');
        await interaction.editReply({ files: [attachment] });

    } catch (err) {
        console.error('Error displaying leaderboard:', err);
        await interaction.editReply('There was an error generating the leaderboard.');
    }
}

module.exports = {
    displayAchievementsHistory,
    displayProgressionBar,
    displayAchievementsList,
    displayNewAchievementImage,
    displayLeaderboard
};