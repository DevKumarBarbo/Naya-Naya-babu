const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('schedules')
    .setDescription('View schedules'),

  async execute(interaction) {
    const data = JSON.parse(fs.readFileSync('./data.json'));

    if (!data.schedules.length) {
      return interaction.reply("No schedules");
    }

    const text = data.schedules.map(s =>
      `ID: ${s.id} | ${s.pattern}`
    ).join("\\n");

    await interaction.reply({ content: text, ephemeral: true });
  }
};
