const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove schedule')
    .addStringOption(o => o.setName('id').setRequired(true)),

  async execute(interaction) {

    const id = interaction.options.getString('id');
    const data = JSON.parse(fs.readFileSync('./data.json'));

    data.schedules = data.schedules.filter(s => s.id != id);

    fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));

    await interaction.reply("❌ Removed");
  }
};
