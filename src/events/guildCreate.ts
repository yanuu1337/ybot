import { MessageEmbed, TextChannel } from 'discord.js';
import { ThreadChannel } from 'discord.js';
import { Guild, GuildChannel } from 'discord.js';
import ArosClient from '../extensions/ArosClient';
import Event from '../lib/structures/Event'
export default class extends Event {
    async execute(client: ArosClient, guild: Guild) {
        if(!guild.available) return;
        client.handlers.guilds.create({
            discord_id: guild.id,
            language: 'en-US',
        })
        const channelFilter = (channel: GuildChannel | ThreadChannel) => {
             
            if(channel.type === "GUILD_PUBLIC_THREAD" || 
                channel.type === "GUILD_CATEGORY" || 
                channel.type === "GUILD_VOICE" || 
                channel.type === "GUILD_NEWS" || 
                channel.type !== "GUILD_TEXT") return false;
            if(!channel.permissionsFor(guild.roles.everyone)?.has("SEND_MESSAGES")) return false;
            return true;
        }
        const potentialWelcomeChannel = guild.channels.cache.find(channelFilter) as TextChannel
        if(!potentialWelcomeChannel) return;
        else {
            const embed = new MessageEmbed()
                .setTitle(`Hi there!`)
                .setFooter("© 2022 - Aros 🎉")
                .setColor(`RANDOM`)
                .setDescription(`Thanks for adding me to this server! Check out all of my features by using the \`help\` command! By the way, my default prefix is \`${process.env.PREFIX!}\`!`)
                .addField(`About me:`, `I'm your friend, Aros! Not only do I include moderation and meme commands, I also have fully-fledged leveling and currency systems!`)
                .addField(`Customization: `, `You can customize my settings in multiple ways, such as my [website](https://aros.folds.cc) or the \`config\` command!`)
            return potentialWelcomeChannel.send({embeds: [embed]})
        }

    }
}