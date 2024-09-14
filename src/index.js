require('dotenv').config();
const axios = require('axios');
const { Client, IntentsBitField, EmbedBuilder, ActivityType } = require('discord.js');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  client.user.setActivity({
    name: 'Clubs and Socs',
    type: ActivityType.Listening,
    url: 'https://clubsandsocs.jakefarrell.ie',
  });

});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'verify') {
    await interaction.reply('You verified!');
  } else if (commandName === 'events') {
    const type = interaction.options.getString('type');
    const name = interaction.options.getString('name');
    const limit = interaction.options.getInteger('limit') || 5;

    try {
      const response = await axios.get(`https://clubsandsocs.jakefarrell.ie/${process.env.CLUBS_AND_SOCS_WEBSITE}/${type}/${name}/events`);
      const { event_count, events } = response.data;

      if (event_count > 0) {
        const embeds = [];

        for (let i = 0; i < event_count && i < limit; i++) {
          const event = events[`event_${i}`];

          const embed = new EmbedBuilder()
            .setTitle(event.name)
            .setImage(event.image)
            .addFields(
              { name: 'Start', value: event.start, inline: true },
              { name: 'End', value: event.end, inline: true },
              { name: 'Cost', value: event.cost, inline: true },
              { name: 'Capacity', value: event.capacity, inline: true },
              { name: 'Type', value: event.type, inline: true },
              { name: 'Location', value: event.location, inline: true }
            );

          if (event.description) {
            embed.setDescription(event.description);
          }

          embeds.push(embed);
        }

        await interaction.reply({ embeds });
      } else {
        await interaction.reply('No events found.');
      }
    } catch (error) {
      console.error(error);
      await interaction.reply('Failed to get events.');
    }
  }

  if (commandName === 'committee') {
    const type = interaction.options.getString('type');
    const name = interaction.options.getString('name');

    try {

      const committeeData = await axios.get(`https://clubsandsocs.jakefarrell.ie/${process.env.CLUBS_AND_SOCS_WEBSITE}/${type}/${name}/committee`);
      const { committee_count, committee_list } = committeeData.data;

      if (committee_count > 0) {
        const embed = new EmbedBuilder()
          .setTitle(`Committee Members: ${name}`)
          .setColor(0x00AE86);

        for (let i = 0; i < committee_count; i++) {
          const member = committee_list[`committee_member${i}`];
          embed.addFields({ name: member.name, value: member.position, inline: true });
        }

        await interaction.reply({ embeds: [embed] });
      } else {
        await interaction.reply('No committee members found.');
      }
    } catch (error) {
      console.error(error);
      await interaction.reply('Failed to retrieve committee members.');
    }
  }
});


client.login(process.env.DISCORD_TOKEN);