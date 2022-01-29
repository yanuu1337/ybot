import { SlashCommandBuilder } from "@discordjs/builders";
import { CacheType, Collection, CommandInteraction, Guild, GuildBan, GuildMember, Message, MessageEmbed } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";
import EmbedFactory from "../../util/EmbedFactory";
import Utility from "../../util/Utility";

export default class extends Command {
    aliases = ['guildinfo', 'gi', 'serverinfo', 'si'];
    isSlashCommand = true;
    usage = 'guildinfo [guild_id]';
    description = 'Get information about the server';
    data = new SlashCommandBuilder()
    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null) {
        
        
        if(!guild) {
            return message.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`Error`, `${Utility.translate(`en-US`, `util/info:NO_GUILD_ERROR`)}`)
            ]});
        }
        if(args[0]) {
            const guild = client.guilds.cache.get(args[0]);

            if(!guild) {
                return message.reply({embeds: [
                    EmbedFactory.generateErrorEmbed(`Error`, `${Utility.translate(`en-US`, `util/info:NO_GUILD_ERROR`)}`)
                ]});
                  
            }
            const guildInterface = await client.handlers.guilds.fetch(guild)
            
            const guildMemberCache = guild.members.cache.filter(member => !member.user.bot);
            const banCache = guild.bans.cache.size ? await guild.bans.fetch() : guild.bans.cache;
            return message.reply({embeds: [this.getInfoDataEmbed(guild, guildInterface, guildMemberCache, banCache)]});
        }

        const guildMemberCache = message.guild?.members.cache.filter(member => !member.user.bot);
        const banCache = !message.guild?.bans.cache.size ? await message.guild?.bans.fetch() : message.guild.bans.cache;
        
            
        return message.reply({embeds: [this.getInfoDataEmbed(message.guild, guild, guildMemberCache, banCache)]});
    }

    async executeSlash(client: ArosClient, cmd: CommandInteraction<CacheType>, guild: GuildInterface | null, isInDms?: boolean): Promise<any> {
        if(!cmd.inGuild() || !cmd.guild) {
            return cmd.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`Error`, `${Utility.translate(`en-US`, `util/info:NO_GUILD_ERROR`)}`)
            ], ephemeral: true});
        }
        const guildMemberCache = cmd.guild?.members.cache.filter(member => !member.user.bot);
        const banCache = !cmd.guild?.bans.cache.size ? await cmd.guild?.bans.fetch() : cmd.guild.bans.cache;
        return cmd.reply({embeds: [this.getInfoDataEmbed(cmd?.guild, guild, guildMemberCache, banCache)]});

    }

    getInfoDataEmbed(msgGuild: Guild | null, guild: GuildInterface | null, guildMemberCache?: Collection<string, GuildMember>, banCache?: Collection<string, GuildBan>) {
        const embed = new MessageEmbed()
            .setTitle(`${Utility.translate(guild?.language, `util/info:INFO`, { guild: msgGuild?.name ?? 'Unknown' })}`)
            .setFooter(`${msgGuild?.name} | © ${new Date().getFullYear()} - yBot 🎉`)
            .addField(`${Utility.translate(guild?.language, `util/info:DISCORD_DATA`)}`, `
                \`•\`🆔: \`${msgGuild?.name}\`
                \`•\`<:datetimegray:927512745337819176> <t:${Math.round((msgGuild?.createdAt?.getTime?.() ?? Date.now()) / 1000)}:R>
                \`•\`<:crowngray:927512745866326037> <@${msgGuild?.ownerId}>
                \`•\`<:regiongray:927512745253933136>: \`deprecated\`
                \`•\` System: ${msgGuild?.systemChannel?.toString() ?? 'None'}
                \`•\` Verif. level: \`${msgGuild?.verificationLevel.toLowerCase()}\`
                \`•\` Explicit content: \`${msgGuild?.explicitContentFilter}\`
                \`•\` Default notifications: \`${msgGuild?.defaultMessageNotifications}\`
            `, true)
            .addField(`${Utility.translate(guild?.language, `util/info:CONFIG`)}`, `
                \`•\`Prefix: \`${guild?.prefix ?? 'default (=)'}\`
                \`•\`Language: \`${guild?.language ?? 'None'}\`
                \`•\`Autoroles: \`${guild?.autoroles?.active ?? false}\`
                \`•\`Mod log: ${guild?.mod_log ? `<#${guild?.mod_log}>` : 'None'}
                \`•\`Added bot: ${guild?.created_at ? `<t:${Math.round( new Date(guild?.created_at!).getTime() / 1000)}:R>` : '`unknown`'}
            `, false)

            .addField(`${Utility.translate(guild?.language, `util/info:MEMBER_COUNT`, {member_count: guildMemberCache?.size ?? 'N/A'})}`, `
                \`•\`<:online:927514969736613909> \`${guildMemberCache?.filter(m => m.presence?.status === 'online').size}\`
                \`•\`<:away:927514970126696519> \`${guildMemberCache?.filter(m => m.presence?.status === 'idle').size}\`
                \`•\`<:dnd:927514970009272320> \`${guildMemberCache?.filter(m => m.presence?.status === 'dnd').size}\`
                \`•\`<:offline:927514969896005633> \`${guildMemberCache?.filter(m => !m.presence?.status || m.presence?.status === 'offline').size}\`
            `, true)
            .addField(`${Utility.translate(guild?.language, `util/info:CHANNEL_COUNT`, {channel_count: msgGuild?.channels.cache.size})}`, `
                \`•\`📝 \`${msgGuild?.channels.cache.filter(c => c.type === 'GUILD_TEXT').size}\`
                \`•\`🔈 \`${msgGuild?.channels.cache.filter(c => c.type === 'GUILD_VOICE').size}\`
                \`•\`📁 \`${msgGuild?.channels.cache.filter(c => c.type === 'GUILD_CATEGORY').size}\`
                \`•\`📣 \`${msgGuild?.channels.cache.filter(c => c.type === 'GUILD_NEWS').size}\`
                \`•\`🧵 \`${msgGuild?.channels.cache.filter(c => c.type === 'GUILD_PRIVATE_THREAD' || c.type === "GUILD_PUBLIC_THREAD").size}\`


            `, true)
            .addField(`${Utility.translate(guild?.language, 
                `util/info:EMOJI_COUNT`, {emoji_count: msgGuild?.emojis.cache.size})}`,
                `${msgGuild?.emojis.cache.size ? [...msgGuild?.emojis?.cache?.values()].slice(0, 20).sort( () => .5 - Math.random() ).join('') : 'None'}`
            )
            .addField(`${Utility.translate(guild?.language, 
                `util/info:BANS_COUNT`, {count: banCache?.size ?? 0})}`,
                `${banCache?.size ? [...banCache.values()].map(ban => `**${ban.user.tag}**`).slice(0, 10).join(', ') : 'None'}`
            )
        guild?.blacklisted && embed.setDescription(`⚠️ **This guild is blacklisted.** \nNone of the commands that interact with this guild will work. Please contact support to appeal.`);
        return embed;
    }

    

        
}