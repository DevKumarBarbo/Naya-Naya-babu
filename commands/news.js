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
    .setDescription('Premium News System')

    .addStringOption(o => o.setName('title').setDescription('Headline'))
    .addStringOption(o => o.setName('summary').setDescription('Summary'))
    .addStringOption(o => o.setName('details').setDescription('Details'))

    .addStringOption(o =>
      o.setName('category')
        .setDescription('Category')
        .addChoices(
          { name: 'General', value: 'General' },
          { name: 'Update', value: 'Update' },
          { name: 'Alert', value: 'Alert' },
          { name: 'Market', value: 'Market' }
        )
    )

    .addStringOption(o =>
      o.setName('priority')
        .setDescription('Priority')
        .addChoices(
          { name: 'Low', value: 'low' },
          { name: 'Medium', value: 'medium' },
          { name: 'High', value: 'high' },
          { name: 'Breaking', value: 'breaking' }
        )
    )

    .addStringOption(o => o.setName('tags'))
    .addStringOption(o => o.setName('image'))
    .addStringOption(o => o.setName('link'))
    .addStringOption(o => o.setName('ping'))

    .addStringOption(o => o.setName('schedule'))
    .addStringOption(o => o.setName('loop'))
    .addStringOption(o => o.setName('cron')),

  async execute(interaction) {

    if (interaction.user.id !== "1409058941115174934")
      return interaction.reply({ content: "❌ Not allowed", ephemeral: true });

    const get = (x, d) => interaction.options.getString(x) || d;

    const title = get('title', "📰 NIF Broadcast");
    const summary = get('summary', "No summary.");
    const details = interaction.options.getString('details');
    const category = get('category', "General");
    const priority = get('priority', "low");
    const tags = interaction.options.getString('tags') || "";

    const image = interaction.options.getString('image');
    const link = interaction.options.getString('link');
    const pingOpt = interaction.options.getString('ping');

    const delay = interaction.options.getString('schedule');
    const loop = interaction.options.getString('loop');
    const cronPattern = interaction.options.getString('cron');

    let ping = "";
    if (pingOpt === "everyone") ping = "@everyone";
    else if (pingOpt === "here") ping = "@here";
    else if (pingOpt && pingOpt !== "none") ping = `<@&${pingOpt}>`;

    let color = 0x2b2d31;
    let pr = "🟢 LOW";
    if (priority === "medium") { color = 0xf1c40f; pr = "🟡 MEDIUM"; }
    if (priority === "high") { color = 0xe74c3c; pr = "🔴 HIGH"; }
    if (priority === "breaking") { color = 0xff0033; pr = "🚨 BREAKING"; }

    // PROFESSIONAL UI
    const embed = new EmbedBuilder()
      .setColor(color)
      .setAuthor({ name: "NIF OFFICIAL SOURCE • LIVE" })
      .setTitle(`📰 ${title}`)
      .setDescription(`━━━━━━━━━━━━━━━━━━
📌 **SUMMARY**
${summary}
━━━━━━━━━━━━━━━━━━`)
      .addFields(
        {
          name: "📊 INFORMATION",
          value: `🏷 ${category}
⚡ ${pr}
🏷 ${tags || "None"}`
        },
        ...(details ? [{
          name: "📖 DETAILS",
          value: details
        }] : [])
      )
      .setFooter({ text: "NIF Network • Verified Broadcast" })
      .setTimestamp();

    if (image) embed.setImage(image);
    if (link) embed.setURL(link);

    // PREVIEW BUTTONS
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('post').setLabel('🚀 Post').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('cancel').setLabel('❌ Cancel').setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
      content: "👀 Preview",
      embeds: [embed],
      components: [row],
      ephemeral: true
    });

    const collector = interaction.channel.createMessageComponentCollector({
      filter: i => i.user.id === interaction.user.id,
      time: 60000
    });

    collector.on('collect', async i => {

      if (i.customId === "cancel")
        return i.update({ content: "❌ Cancelled", embeds: [], components: [] });

      const send = () => interaction.channel.send({
        content: ping,
        embeds: [embed],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('stats').setLabel('📊 Stats').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('bookmark').setLabel('🔖 Save').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setLabel('🌐 Open').setStyle(ButtonStyle.Link).setURL(link || "https://google.com")
          )
        ]
      });

      if (delay) {
        setTimeout(send, parseInt(delay) * 60000);
        return i.update({ content: "⏰ Scheduled", embeds: [], components: [] });
      }

      if (loop) {
        setInterval(send, parseInt(loop) * 60000);
        return i.update({ content: "🔁 Loop started", embeds: [], components: [] });
      }

      if (cronPattern) {
        cron.schedule(cronPattern, send);

        const data = JSON.parse(fs.readFileSync('./data.json'));
        data.schedules.push({
          id: Date.now(),
          pattern: cronPattern,
          channel: interaction.channel.id,
          payload: { content: ping, embeds: [embed.data] }
        });

        fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));

        return i.update({ content: "🕒 Cron scheduled", embeds: [], components: [] });
      }

      await send();
      return i.update({ content: "✅ Posted", embeds: [], components: [] });
    });
  }
};
