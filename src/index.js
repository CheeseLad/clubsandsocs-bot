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

client.on('ready', async () => {
  console.log(`✅ Bot logged in as ${client.user.tag}!`);
  console.log(`🔗 Connected to ${client.guilds.cache.size} guild(s)`);

  try {
    console.log('🔄 Fetching clubs and societies data...');
    const [societiesResponse, clubsResponse] = await Promise.all([
      axios.get(`https://clubsandsocs.jakefarrell.ie/${process.env.CLUBS_AND_SOCS_WEBSITE}/society`),
      axios.get(`https://clubsandsocs.jakefarrell.ie/${process.env.CLUBS_AND_SOCS_WEBSITE}/club`)
    ]);

    const societiesCount = societiesResponse.data.length;
    const clubsCount = clubsResponse.data.length;
    const totalCount = societiesCount + clubsCount;

    console.log(`📊 Found ${societiesCount} societies and ${clubsCount} clubs (Total: ${totalCount})`);

    client.user.setActivity({
      name: `${totalCount} Clubs and Socs`,
      type: ActivityType.Watching,
      url: 'https://clubsandsocs.jakefarrell.ie',
    });

    console.log(`🎯 Activity set: Watching ${totalCount} Clubs & Socs`);
  } catch (error) {
    console.error('❌ Failed to fetch clubs and societies count:', error.message);
    console.log('🔄 Setting fallback activity...');
    
    client.user.setActivity({
      name: 'Clubs & Socs',
      type: ActivityType.Listening,
      url: 'https://clubsandsocs.jakefarrell.ie',
    });
    
    console.log('✅ Fallback activity set');
  }

});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;
  console.log(`🎮 Command received: ${commandName} from ${interaction.user.tag} in ${interaction.guild?.name || 'DM'}`);

  if (commandName === 'verify') {
    console.log('✅ Processing verify command');
    await interaction.reply('You verified!');
  } else if (commandName === 'events') {
    const type = interaction.options.getString('type');
    const name = interaction.options.getString('name');
    const limit = interaction.options.getInteger('limit') || 5;

    console.log(`📅 Processing events command - Type: ${type}, Name: ${name}, Limit: ${limit}`);

    try {
      console.log(`🔄 Fetching events for ${type}/${name}...`);
      const response = await axios.get(`https://clubsandsocs.jakefarrell.ie/${process.env.CLUBS_AND_SOCS_WEBSITE}/${type}/${name}/events`);
      const { event_count, events } = response.data;

      console.log(`📊 Found ${event_count} events for ${name}`);

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

        console.log(`✅ Sending ${embeds.length} event embeds`);
        await interaction.reply({ embeds });
      } else {
        console.log('ℹ️ No events found, sending empty response');
        await interaction.reply('No events found.');
      }
    } catch (error) {
      console.error(`❌ Error fetching events for ${type}/${name}:`, error.message);
      await interaction.reply('Failed to get events.');
    }
  }

  if (commandName === 'committee') {
    const type = interaction.options.getString('type');
    const name = interaction.options.getString('name');

    console.log(`👥 Processing committee command - Type: ${type}, Name: ${name}`);

    try {
      console.log(`🔄 Fetching committee data for ${type}/${name}...`);
      const committeeData = await axios.get(`https://clubsandsocs.jakefarrell.ie/${process.env.CLUBS_AND_SOCS_WEBSITE}/${type}/${name}/committee`);
      const committeeMembers = committeeData.data;

      console.log(`📊 Found ${committeeMembers.length} committee members for ${name}`);

      if (committeeMembers.length > 0) {
        const embed = new EmbedBuilder()
          .setTitle(`Committee Members: ${name}`)
          .setColor(0x00AE86);

        for (const member of committeeMembers) {
          embed.addFields({ name: member.name, value: member.position, inline: true });
        }

        console.log(`✅ Sending committee embed with ${committeeMembers.length} members`);
        await interaction.reply({ embeds: [embed] });
      } else {
        console.log('ℹ️ No committee members found, sending empty response');
        await interaction.reply('No committee members found.');
      }
    } catch (error) {
      console.error(`❌ Error fetching committee for ${type}/${name}:`, error.message);
      await interaction.reply('Failed to retrieve committee members.');
    }
  }

  if (commandName === 'gallery') {
    const type = interaction.options.getString('type');
    const name = interaction.options.getString('name');
    const limit = interaction.options.getInteger('limit') || 5;

    console.log(`🖼️ Processing gallery command - Type: ${type}, Name: ${name}, Limit: ${limit}`);

    try {
      console.log(`🔄 Fetching gallery data for ${type}/${name}...`);
      const galleryData = await axios.get(`https://clubsandsocs.jakefarrell.ie/${process.env.CLUBS_AND_SOCS_WEBSITE}/${type}/${name}/gallery`);
      const images = galleryData.data;

      console.log(`📊 Found ${images.length} images for ${name}`);

      if (images.length > 0) {
        const maxImages = Math.min(limit, images.length);
        
        // Create a single embed with the first image as main image
        const embed = new EmbedBuilder()
          .setTitle(`📸 Gallery: ${name}`)
          .setDescription(`Gallery contains ${images.length} images`)
          .setImage(images[0]) // Main image
          .setColor(0x00AE86)
          .setFooter({ text: `Showing 1 of ${images.length} images` });

        // Add clickable links to other images in description
        if (images.length > 1) {
          const imageLinks = images.slice(1, maxImages).map((url, index) => {
            return `[Image ${index + 2}](${url})`;
          }).join(' • ');
          
          embed.setDescription(`Gallery contains ${images.length} images\n\n**Additional Images:**\n${imageLinks}`);
        }

        console.log(`✅ Sending gallery embed with ${Math.min(maxImages, images.length)} image links`);
        await interaction.reply({ embeds: [embed] });

        // If there are more images than we can show links for, mention it
        if (images.length > maxImages) {
          console.log(`ℹ️ ${images.length - maxImages} additional images not shown due to limit`);
        }
      } else {
        console.log('ℹ️ No gallery images found, sending empty response');
        await interaction.reply('No gallery images found.');
      }
    } catch (error) {
      console.error(`❌ Error fetching gallery for ${type}/${name}:`, error.message);
      await interaction.reply('Failed to retrieve gallery images.');
    }
  }
});


console.log('🚀 Starting Discord bot...');
client.login(process.env.DISCORD_TOKEN);