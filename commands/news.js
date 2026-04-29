const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('news')
    .setDescription('Post news')
    .addStringOption(o => o.setName('title').setDescription('Title').setRequired(true))
    .addStringOption(o => o.setName('description').setDescription('Description').setRequired(true))
    .addStringOption(o => o.setName('link').setDescription('Link'))
    .addStringOption(o => o.setName('image').setDescription('Image URL')),

  async execute(interaction) {

    const ALLOWED_USER_ID = "1409058941115174934";
    if (interaction.user.id !== ALLOWED_USER_ID) {
      return interaction.reply({ content: "Not allowed", ephemeral: true });
    }

    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const link = interaction.options.getString('link');
    const image = interaction.options.getString('image');

    const channel = interaction.client.channels.cache.get("1488859977983463582");
    if (!channel) return interaction.reply({ content: "Channel not found", ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(0xff0000)
      .setTimestamp();

    if (link) embed.setURL(link);
    if (image) embed.setImage(image);

    await channel.send({
      content: "@everyone",
      embeds: [embed]
    });

    await interaction.reply({ content: "Sent ✅", ephemeral: true });
  }
};
