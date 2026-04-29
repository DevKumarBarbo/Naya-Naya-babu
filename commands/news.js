const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const fs = require('fs');
const cron = require('node-cron');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('news')
    .setDescription('Pro News System')

    .addStringOption(o => o.setName('title').setRequired(true))
    .addStringOption(o => o.setName('description').setRequired(true))
    .addStringOption(o => o.setName('link'))
    .addStringOption(o => o.setName('image'))
    .addStringOption(o => o.setName('theme'))
    .addStringOption(o => o.setName('schedule'))
    .addStringOption(o => o.setName('loop'))
    .addStringOption(o => o.setName('cron'))
    .addStringOption(o => o.setName('ping')),

  async execute(interaction) {

    const ALLOWED_USER_ID = "1409058941115174934";
    if (interaction.user.id !== ALLOWED_USER_ID) {
      return interaction.reply({ content: "❌ Not allowed", ephemeral: true });
    }

    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const link = interaction.options.getString('link');
    const image = interaction.options.getString('image');
    const theme = interaction.options.getString('theme');
    const schedule = interaction.options.getString('schedule');
    const loop = interaction.options.getString('loop');
    const cronPattern = interaction.options.getString('cron');
    const ping = interaction.options.getString('ping');

    const channel = interaction.client.channels.cache.get("1488859977983463582");

    let color = 0x00bfff;
    if (theme === "neon") color = 0x39ff14;
    if (theme === "gold") color = 0xffd700;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: "🛰️ NIF Global News",
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setTitle(`📰 ${title}`)
      .setDescription(
`> ${description}

━━━━━━━━━━━━━━━━━━━

⏰ <t:${Math.floor(Date.now()/1000)}:R>
━━━━━━━━━━━━━━━━━━━`
      )
      .setColor(color)
      .setFooter({
        text: "NIF News System",
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setTimestamp();

    if (image) embed.setImage(image);
    if (link) embed.setURL(link);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('read_more')
        .setLabel('📊 Stats')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setLabel('🌐 Open')
        .setStyle(ButtonStyle.Link)
        .setURL(link || "https://google.com"),

      new ButtonBuilder()
        .setCustomId('bookmark')
        .setLabel('🔖 Save')
        .setStyle(ButtonStyle.Secondary)
    );

    const send = async () => {
      const msg = await channel.send({
        content: ping || "@everyone",
        embeds: [embed],
        components: [row]
      });

      const data = JSON.parse(fs.readFileSync('./data.json'));
      data.lastMessageId = msg.id;
      fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));
    };

    if (schedule) {
      setTimeout(send, parseInt(schedule) * 60000);
      return interaction.reply({ content: "⏰ Scheduled", ephemeral: true });
    }

    if (loop) {
      setInterval(send, parseInt(loop) * 60000);
      return interaction.reply({ content: "🔁 Loop started", ephemeral: true });
    }

    if (cronPattern) {
      cron.schedule(cronPattern, send);

      const data = JSON.parse(fs.readFileSync('./data.json'));
      data.cronJobs.push({
        pattern: cronPattern,
        channel: "1488859977983463582",
        embed: embed.data,
        ping
      });

      fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));

      return interaction.reply({ content: "🕒 Cron active", ephemeral: true });
    }

    await send();
    return interaction.reply({ content: "✅ Posted", ephemeral: true });
  }
};
