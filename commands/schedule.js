const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const cron = require('node-cron');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('schedule')
    .setDescription('Advanced scheduler')
    .addStringOption(o => o.setName('cron').setRequired(true))
    .addStringOption(o => o.setName('message').setRequired(true)),

  async execute(interaction) {

    const cronPattern = interaction.options.getString('cron');
    const message = interaction.options.getString('message');

    const payload = { content: message };

    const data = JSON.parse(fs.readFileSync('./data.json'));

    data.schedules.push({
      id: Date.now(),
      pattern: cronPattern,
      channel: interaction.channel.id,
      payload
    });

    fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));

    cron.schedule(cronPattern, () => {
      interaction.channel.send(payload);
    });

    await interaction.reply("🕒 Scheduled");
  }
};
