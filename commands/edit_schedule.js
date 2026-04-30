const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('edit_schedule')
    .setDescription('Edit scheduled post')
    .addStringOption(o => o.setName('id').setRequired(true))
    .addStringOption(o => o.setName('title'))
    .addStringOption(o => o.setName('summary')),

  async execute(interaction) {
    const id = interaction.options.getString('id');
    const data = JSON.parse(fs.readFileSync('./data.json'));

    const s = data.schedules.find(x => x.id == id);
    if (!s) return interaction.reply("❌ Not found");

    const title = interaction.options.getString('title');
    const summary = interaction.options.getString('summary');

    if (title) s.payload.embeds[0].title = title;
    if (summary) s.payload.embeds[0].description = summary;

    fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));

    interaction.reply("✏️ Updated");
  }
};
