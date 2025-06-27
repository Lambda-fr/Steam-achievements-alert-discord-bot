import { ButtonBuilder, ButtonStyle } from 'discord.js';
const backButton = new ButtonBuilder({
  style: ButtonStyle.Secondary,
  label: 'Back',
  emoji: '⬅️',
  customId: 'back'
})
const forwardButton = new ButtonBuilder({
  style: ButtonStyle.Secondary,
  label: 'Forward',
  emoji: '➡️',
  customId: 'forward'
})

export { backButton, forwardButton };