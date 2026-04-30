const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('manage')
    .setDescription('Edit/Delete last post')
    .addStringOption(o => o.setName('action').setRequired(true))
    .addStringOption(o => o.setName('text')),

  async execute(interaction) {

    const data = JSON.parse(fs.readFileSync('./data.json'));
    const msg = await interaction.channel.messages.fetch(data.lastMessageId);

    const action = interaction.options.getString('action');

    if (action === "delete") {
      await msg.delete();
      return interaction.reply("🗑 Deleted");
    }

    if (action === "edit") {
      const text = interaction.options.getString('text');
      await msg.edit({ content: text });
      return interaction.reply("✏️ Edited");
    }
  }
};
