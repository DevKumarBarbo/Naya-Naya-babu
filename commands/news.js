const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('news')
    .setDescription('Ultra News')

    .addStringOption(o => o.setName('title'))
    .addStringOption(o => o.setName('description'))
    .addStringOption(o => o.setName('link'))
    .addStringOption(o => o.setName('image'))
    .addStringOption(o => o.setName('theme')),

  async execute(interaction) {

    if (interaction.user.id !== "1409058941115174934") {
      return interaction.reply({ content: "❌ Not allowed", ephemeral: true });
    }

    const title = interaction.options.getString('title') || "📰 Breaking News";
    const description = interaction.options.getString('description') || "";
    const link = interaction.options.getString('link');
    const image = interaction.options.getString('image');
    const theme = interaction.options.getString('theme');

    let color = 0x5865F2;
    if (theme === "neon") color = 0x39ff14;
    if (theme === "gold") color = 0xffd700;
    if (theme === "red") color = 0xff0033;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: "🛰️ NIF OFFICIAL SOURCE",
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setTitle(title)
      .setDescription(description || "‎")
      .setColor(color)
      .setFooter({
        text: "NIF Network • Live",
      })
      .setTimestamp();

    if (image) embed.setImage(image);
    if (link) embed.setURL(link);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('clicks')
        .setLabel('📊 Stats')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setLabel('🌐 Open')
        .setStyle(ButtonStyle.Link)
        .setURL(link || "https://google.com")
    );

    const msg = await interaction.channel.send({
      content: "@everyone",
      embeds: [embed],
      components: [row]
    });

    const data = JSON.parse(fs.readFileSync('./data.json'));
    data.lastMessageId = msg.id;
    fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));

    await interaction.reply({ content: "✅ Posted", ephemeral: true });
  }
};
