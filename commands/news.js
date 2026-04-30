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
    .setDescription('NIF Broadcast System')

    .addStringOption(o => o.setName('title'))
    .addStringOption(o => o.setName('summary'))
    .addStringOption(o => o.setName('details'))
    .addStringOption(o => o.setName('category'))
    .addStringOption(o => o.setName('tags'))
    .addStringOption(o => o.setName('urgency'))
    .addStringOption(o => o.setName('link'))
    .addStringOption(o => o.setName('image'))
    .addStringOption(o => o.setName('theme'))
    .addStringOption(o => o.setName('ping'))
    .addStringOption(o => o.setName('schedule'))
    .addStringOption(o => o.setName('loop'))
    .addStringOption(o => o.setName('cron')),

  async execute(interaction) {

    if (interaction.user.id !== "1409058941115174934") {
      return interaction.reply({ content: "❌ Not allowed", ephemeral: true });
    }

    const get = (x, d) => interaction.options.getString(x) || d;

    const title = get('title', "📰 NIF News Update");
    const summary = get('summary', "No summary provided.");
    const details = interaction.options.getString('details');
    const category = get('category', "General");
    const tagsRaw = interaction.options.getString('tags');
    const urgency = get('urgency', "low").toLowerCase();
    const link = interaction.options.getString('link');
    const image = interaction.options.getString('image');
    const theme = interaction.options.getString('theme');
    const pingOpt = interaction.options.getString('ping');

    const schedule = interaction.options.getString('schedule');
    const loop = interaction.options.getString('loop');
    const cronPattern = interaction.options.getString('cron');

    // PING
    let ping = "";
    if (pingOpt === "everyone") ping = "@everyone";
    else if (pingOpt === "here") ping = "@here";
    else if (pingOpt && pingOpt !== "none") ping = `<@&${pingOpt}>`;

    // TAGS
    let tags = "";
    if (tagsRaw) tags = tagsRaw.split(",").map(t => `\`${t.trim()}\``).join(" ");

    // COLOR + PRIORITY
    let color = 0x2b2d31;
    let urgencyLabel = "🟢 LOW";

    if (urgency === "medium") { color = 0xf1c40f; urgencyLabel = "🟡 MEDIUM"; }
    if (urgency === "high") { color = 0xe74c3c; urgencyLabel = "🔴 HIGH"; }
    if (urgency === "breaking") { color = 0xff0033; urgencyLabel = "🚨 BREAKING"; }

    if (theme === "neon") color = 0x39ff14;
    if (theme === "gold") color = 0xffd700;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: "NIF OFFICIAL SOURCE",
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setTitle(title)
      .setColor(color)
      .addFields(
        { name: "📌 Summary", value: summary },
        ...(details ? [{ name: "📖 Details", value: details }] : []),
        { name: "🏷 Category", value: category, inline: true },
        { name: "⚡ Priority", value: urgencyLabel, inline: true },
        ...(tags ? [{ name: "🏷 Tags", value: tags }] : [])
      )
      .setFooter({ text: "NIF Network • Verified Broadcast" })
      .setTimestamp();

    if (image) embed.setImage(image);
    if (link) embed.setURL(link);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('stats')
        .setLabel('📊 Analytics')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId('bookmark')
        .setLabel('🔖 Save')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setLabel('🌐 Open')
        .setStyle(ButtonStyle.Link)
        .setURL(link || "https://google.com")
    );

    const channel = interaction.channel;

    const send = async () => {
      const msg = await channel.send({
        content: ping,
        embeds: [embed],
        components: [row]
      });

      const data = JSON.parse(fs.readFileSync('./data.json'));
      data.lastMessageId = msg.id;
      fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));
    };

    if (schedule) {
      setTimeout(send, parseInt(schedule) * 60000);
      return interaction.reply("⏰ Scheduled");
    }

    if (loop) {
      setInterval(send, parseInt(loop) * 60000);
      return interaction.reply("🔁 Loop started");
    }

    if (cronPattern) {
      cron.schedule(cronPattern, send);

      const data = JSON.parse(fs.readFileSync('./data.json'));
      data.schedules.push({
        id: Date.now(),
        pattern: cronPattern,
        channel: channel.id,
        payload: { content: ping, embeds: [embed.data] }
      });

      fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));

      return interaction.reply("🕒 Cron scheduled");
    }

    await send();
    return interaction.reply("✅ Broadcast sent");
  }
};
