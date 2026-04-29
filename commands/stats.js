const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View analytics'),

  async execute(interaction) {
    const data = JSON.parse(fs.readFileSync('./data.json'));
    await interaction.reply({
      content: `📊 ${JSON.stringify(data.clicks, null, 2)}`,
      ephemeral: true
    });
  }
};
