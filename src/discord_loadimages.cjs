const { backButton, forwardButton } = require('../assets/buttons');
const { AttachmentBuilder, EmbedBuilder, ActionRowBuilder } = require('discord.js');
const { printAtWordWrap } = require('../assets/utils')
const Canvas = require('canvas');
require('chartjs-adapter-moment')
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

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
        [background, blue_bar, black_bar, grey_bar] = await Promise.all([Canvas.loadImage('./assets/background.jpg'), Canvas.loadImage('./assets/blue_progress_bar.png'),
        Canvas.loadImage('./assets/black_progress_bar.png'), Canvas.loadImage('./assets/grey_progress_bar.png')])

        var users_nb_unlocked_not_null = Object.entries(gameObject.nbUnlocked).filter(([k, v]) => v.nbUnlocked !== 0 && v.user.guilds.includes(interaction.guildId))
        Canvas.registerFont('./assets/OpenSans-VariableFont_wdth,wght.ttf', { family: 'Open Sans Regular' })
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
            if (u[0].timePlayedByGame[gameObject.id] === undefined) {
                u[0].timePlayedByGame[gameObject.id] = 0
            }
        })

        await interaction.deferReply();
        if (users_nb_unlocked_not_null.length > 0) {
            var n = 0;

            context.font = '25px "Open Sans Regular"';
            context.fillStyle = '#ffffff';
            context.fillText("Progress on " + name_display, 25, 35);

            const tps_max = Math.max(...users_nb_unlocked_not_null.map(u => { return u[0].timePlayedByGame[gameObject.id] }))

            const barLength = 480

            users_nb_unlocked_not_null.forEach((v) => {
                context.drawImage(v[0].avatar, 25, 48 + n * 70, 50, 50);
                context.font = '15px "Open Sans Regular"';
                context.fillStyle = '#bfbfbf';
                context.fillText(`${v[1]}/${gameObject.nbTotal} (${parseInt(100 * v[1] / gameObject.nbTotal)}%)`, 100 + barLength + 10, 71 + n * 70);
                context.drawImage(black_bar, 100, 58 + n * 70, barLength, 15);
                context.drawImage(blue_bar, 100, 58 + n * 70, barLength * v[1] / gameObject.nbTotal, 15);
                context.fillText(`${v[0].timePlayedByGame[gameObject.id]} h`, 100 + barLength + 10, 91 + n * 70);
                context.drawImage(black_bar, 100, 78 + n * 70, barLength, 15);
                context.drawImage(grey_bar, 100, 78 + n * 70, barLength * v[0].timePlayedByGame[gameObject.id] / tps_max, 15)
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
    const background = await Canvas.loadImage('./assets/background.jpg')
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

module.exports = {
    displayAchievementsHistory,
    displayProgressionBar,
    displayAchievementsList
};