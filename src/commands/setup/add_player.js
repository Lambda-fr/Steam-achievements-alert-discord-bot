import { SlashCommandBuilder } from 'discord.js';
import { addUserDB } from '../../connectAndQueryJSON.js';
import User from '../../models/User.js';
import { loadAvatars, isPublicProfile } from '../../steam/api.js';


export const data = new SlashCommandBuilder()
	.setName('add_player')
	.setDescription('Add a new player to be listened to for new achievements')
	.addUserOption(option => option.setName('player_mention')
		.setDescription('player mention')
		.setRequired(true))
	.addStringOption(option => option.setName('steam_user_id')
		.setDescription('the steam user id')
		.setRequired(true))
	.addStringOption(option => option.setName('nickname')
		.setDescription('the nickname you want to set for this player')
		.setRequired(true));
export async function execute(interaction) {
	const discord_id = interaction.options.getUser('player_mention').id;
	const steam_id = interaction.options.getString('steam_user_id');
	const nickname = interaction.options.getString('nickname');
	var is_new_player = true;
	if (/^\d+$/.test(steam_id) === false) {
		await interaction.reply(`Wrong Steam ID`);
		return;
	}
	const statusProfile = await isPublicProfile(steam_id);
	if (statusProfile !== 1) {
		if (statusProfile === 0) {
			await interaction.reply(`${steam_id} is not public. Can't read infos.`);
		}
		else {
			await interaction.reply(`API Steam error. Please retry later.`);
		}
		return;
	}
	for (var user of interaction.client.data.users) {
		if (user.discord_id === discord_id) {
			is_new_player = false;
			if (user.steam_id != steam_id) {
				await interaction.reply('User already in the DB but with another steam Id.');
				return;
			}
			if (user.nickname != nickname) {
				await interaction.reply('User already in the DB but with another nickname.');
				return;
			}
			if (user.guilds.includes(interaction.guildId)) {
				await interaction.reply('Player is already in the list');
				// resolve()
				return;
			}
			user.guilds.push(interaction.guildId);
			break;
		}
	}

	const color = '#' + Math.floor(Math.random() * 16777215).toString(16);
	console.log(color);
	if (is_new_player) {
		interaction.client.data.users.push(new User(steam_id, discord_id, nickname, [interaction.guildId], color));
	}
	addUserDB(discord_id, steam_id, nickname, interaction, color)
		.then(async () => {
			var userObject = interaction.client.data.users.find(user => user.discord_id === discord_id);
			await loadAvatars([userObject]);
			userObject.getPlaytime(interaction.client.data.games);
			interaction.client.data.games.map(game => game.updateAchievementsForUser(userObject, interaction.client.data.t_lookback));
		});
}