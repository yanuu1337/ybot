import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, CommandInteraction, Message, PermissionString, TextChannel } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";
import EmbedFactory from "../../util/EmbedFactory";
import Utility from "../../util/Utility";

export default class extends Command {
    permissions = ['MANAGE_GUILD'] as PermissionString[];
    isSlashCommand = true;
    description = 'Configure the bot for your server.';
    dm = false;
    usage = 'config [language|modlog|prefix|pins|tag_restrict] <value>';
    data = new SlashCommandBuilder()
        .addSubcommand(sub => sub.setName("view").setDescription("View the current configuration."))
        .addSubcommand(sub => sub.setName("modlog").setDescription("Set/view the modlog configuration.")
            .addChannelOption(opt => opt.setName("channel").setRequired(false).setDescription("The channel to set the modlog as."))
        )
        .addSubcommand(sub => sub.setName("prefix").setDescription("Set/view the prefix configuration")
            .addStringOption(opt => opt.setName("prefix").setRequired(false).setDescription("The prefix to set the bot to."))
        )
        .addSubcommand(sub => sub.setName("pinchannel").setDescription("Set/view the pinned messages channel configuration.")
            .addChannelOption(opt => opt.setName("channel").setRequired(false).setDescription("The channel to send the pinned messages to."))
        ).addSubcommand(sub => sub.setName("level_toggle").setDescription("Toggle the level system.").addBooleanOption(opt =>
            opt.setName("enable").setRequired(false).setDescription("Whether or not the level system should be enabled."))
        )
    async execute(client: ArosClient, msg: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        //TODO Prefixes, other stuff
        if(!args[0]) {
            const embed = EmbedFactory.generateInfoEmbed(`${Utility.translate(guild?.language, "common:SUCCESS")}`, `${Utility.translate(guild?.language, "config/cfg:INFO")}`)
                .addFields([
                    {
                        name: `${Utility.translate(guild?.language, "config/cfg:LANGUAGE")} - \`language\``,
                        value: `${Utility.translate(guild?.language, "config/cfg:LANGUAGE_DESC")} - \`${guild?.language}\``,
                        inline: false
                    },
                    {
                        name: `${Utility.translate(guild?.language, "config/cfg:AUTOROLE")}`,
                        value: `${Utility.translate(guild?.language, "config/cfg:AUTOROLE_DESC")} - \`${guild?.autoroles?.active ? Utility.translate(guild?.language, "common:YES") : Utility.translate(guild?.language, "common:NO")}\` \nThis is not configurable through this command. use the \`autoroles\` command.`,
                        inline: false
                    },
                    {
                        name: `${Utility.translate(guild?.language, "config/cfg:MODLOG")} - \`modlog\``,
                        value: `${Utility.translate(guild?.language, "config/cfg:MODLOG_DESC")} - ${guild?.mod_log ? `<#${guild?.mod_log}>` : `\`${Utility.translate(guild?.language, "common:NONE")}\``}`,
                        inline: false
                    },
                    {
                        name: `${Utility.translate(guild?.language, "config/cfg:PIN_CHANNEL")} - \`pins\``,
                        value: `${Utility.translate(guild?.language, "config/cfg:PIN_CHANNEL_DESC")} - ${guild?.config?.pin_channel ? `<#${guild?.config?.pin_channel}>` : `\`${Utility.translate(guild?.language, "common:NONE")}\``}`,
                        inline: false
                    },
                    {
                        name: `${Utility.translate(guild?.language, "config/cfg:TAG_RESTRICTION")} - \`tag_restrict\``,
                        value: `${Utility.translate(guild?.language, "config/cfg:TAG_RESTRICTION_DESC")} - ${guild?.config?.pin_channel ? `<@&${guild?.config?.tag_restrict}>` : `\`${Utility.translate(guild?.language, "common:NONE")}\``}`,
                        inline: false
                    },
                    {
                        name: `${Utility.translate(guild?.language, "config/cfg:LEVEL_TOGGLE")} - \`level_toggle\``,
                        value: `${Utility.translate(guild?.language, "config/cfg:LEVEL_TOGGLE_DESC")} - ${guild?.config?.pin_channel ? `\`${Utility.translate(guild?.language, "common:YES")}\`` : `\`${Utility.translate(guild?.language, "common:NO")}\``}`,
                        inline: false
                    }      
            ]);
            return msg.reply({embeds: [embed]})
        }
        const configKeys = ["language", "modlog", "prefix", "pins", "tag_restrict", "level_toggle"]
        
        if(!configKeys.includes(args[0])) {
            return msg.reply(Utility.translate(guild?.language, "config/cfg:INVALID_ARG", {key: args[0], keys: configKeys.map((val) => `\`${val}\``).join(', ')}));
        }
        

        if(args[0] === "language") {
            if(!["en", "pl"].includes(args[1])) {
                return msg.reply(Utility.translate(guild?.language, "config/cfg:INVALID_LANGUAGE"));
            }
            await client.handlers.guilds.edit(msg.guild!, {language: args[1]});
            return msg.reply({embeds: [EmbedFactory.generateInfoEmbed(`${Utility.translate(guild?.language, "common:SUCCESS")}`, `${Utility.translate(guild?.language, "config/cfg:LANGUAGE_CHANGED", {lang: args[1]})}`)]});
        
        } else if(args[0] === "modlog") {
            
            if(!args[1] || args[1] === "none" || args[1] === "null") {
                await client.handlers.guilds.edit(msg.guild!, {mod_log: null});
                return msg.reply({embeds: [EmbedFactory.generateInfoEmbed(`${Utility.translate(guild?.language, "common:SUCCESS")}`, `${Utility.translate(guild?.language, "config/cfg:MODLOG_SET", {channel: Utility.translate(guild?.language, "common:NONE")})}`)]});
            }
            
            const channel = msg.mentions.channels.first() || msg.guild?.channels.cache.find(c => c.id === args[1] || c.toString() === args[1]);
            
            if(!channel) {
                return msg.reply(Utility.translate(guild?.language, "config/cfg:INVALID_CHANNEL"));
            }
            
            await client.handlers.guilds.edit(msg.guild!, {mod_log: channel.id});
            return msg.reply({embeds: [EmbedFactory.generateInfoEmbed(`${Utility.translate(guild?.language, "common:SUCCESS")}`, `${Utility.translate(guild?.language, "config/cfg:MODLOG_SET", {channel: channel.toString()})}`)]});
        
        } else if (args[0] === "prefix") {
            
            await this.client.handlers.guilds.edit(msg.guild!, {prefix: args[1]})
            return msg.reply({embeds: [
                EmbedFactory.generateInfoEmbed(
                    `${Utility.translate(
                        guild?.language,
                        "common:SUCCESS"
                    )}`,
                    `${Utility.translate(
                        guild?.language,
                        "config/cfg:PREFIX_CHANGED",
                        {prefix: args[1]}
                    )}`)
                ]})
        } else if (args[0] === "pins") {
            if(!args[1] || args[1] === "none" || args[1] === "null") {
                await client.handlers.guilds.editConfig(msg.guild!, {pin_channel: null});
                return msg.reply({embeds: [EmbedFactory.generateInfoEmbed(`${Utility.translate(guild?.language, "common:SUCCESS")}`, `${Utility.translate(guild?.language, "config/cfg:PIN_CHANNEL_SET", {channel: Utility.translate(guild?.language, "common:NONE")})}`)]});
            }
            
            const channel = msg.mentions.channels.first() || msg.guild?.channels.cache.find(c => c.id === args[1] || c.toString() === args[1]);
            
            if(!channel) {
                return msg.reply(Utility.translate(guild?.language, "config/cfg:INVALID_CHANNEL"));
            }
            
            await client.handlers.guilds.editConfig(msg.guild!, {pin_channel: channel.id});
            return msg.reply({embeds: [EmbedFactory.generateInfoEmbed(`${Utility.translate(guild?.language, "common:SUCCESS")}`, `${Utility.translate(guild?.language, "config/cfg:PIN_CHANNEL_SET", {channel: channel.toString()})}`)]});
        
        } else if (args[0] === "tag_restrict") {
            if(!args[1] || args[1] === "none" || args[1] === "null") {
                await client.handlers.guilds.editConfig(msg.guild!, {tag_restrict: null});
                return msg.reply({embeds: [EmbedFactory.generateInfoEmbed(`${Utility.translate(guild?.language, "common:SUCCESS")}`, `${Utility.translate(guild?.language, "config/cfg:TAG_RESTRICTION_SET", {role: Utility.translate(guild?.language, "common:NONE")})}`)]});
            }
            
            const role = msg.mentions.roles.first() || msg.guild?.roles.cache.find(c => c.id === args[1] || c.toString() === args[1]);
            
            if(!role) {
                return msg.reply(Utility.translate(guild?.language, "config/cfg:INVALID_ROLE"));
            }
            await client.handlers.guilds.editConfig(msg.guild!, {tag_restrict: role.id});
            return msg.reply({embeds: [EmbedFactory.generateInfoEmbed(`${Utility.translate(guild?.language, "common:SUCCESS")}`, `${Utility.translate(guild?.language, "config/cfg:TAG_RESTRICTION_SET", {role: role.toString()})}`)]});
        
        } else if (args[0] === "level_toggle") {
            const toggled = await client.handlers.levels.toggleLeveling(msg.guild!);
            return msg.reply({embeds: [
                EmbedFactory.generateInfoEmbed(`${Utility.translate(guild?.language, "common:SUCCESS")}`, `${Utility.translate(guild?.language, `config/cfg:LEVELING_TOGGLE_${toggled ? 'ON' : 'OFF'}`)}`)
            ]})
        } else {
            return msg.reply(Utility.translate(guild?.language, "config/cfg:INVALID_ARG"));
        }

    }
    async executeSlash(client: ArosClient, cmd: CommandInteraction<CacheType>, guild: GuildInterface | null, isInDms?: boolean): Promise<any> {
        const sub = cmd.options.getSubcommand() as "view" | "modlog" | "prefix" | "pinchannel" | "level_toggle";
        if(sub === "view") {
            const embed = EmbedFactory.generateInfoEmbed(`${Utility.translate(guild?.language, "common:SUCCESS")}`, `${Utility.translate(guild?.language, "config/cfg:INFO")}`)
                .addFields([
                    {
                        name: `${Utility.translate(guild?.language, "config/cfg:LANGUAGE")}`,
                        value: `${Utility.translate(guild?.language, "config/cfg:LANGUAGE_DESC")} - \`${guild?.language}\``,
                        inline: false
                    },
                    {
                        name: `${Utility.translate(guild?.language, "config/cfg:AUTOROLE")}`,
                        value: `${Utility.translate(guild?.language, "config/cfg:AUTOROLE_DESC")} - \`${guild?.autoroles?.active ? Utility.translate(guild?.language, "common:YES") : Utility.translate(guild?.language, "common:NO")}\``,
                        inline: false
                    },
                    {
                        name: `${Utility.translate(guild?.language, "config/cfg:MODLOG")}`,
                        value: `${Utility.translate(guild?.language, "config/cfg:MODLOG_DESC")} - ${guild?.mod_log ? `<#${guild?.mod_log}>` : `\`${Utility.translate(guild?.language, "common:NONE")}\``}`,
                        inline: false
                    },
                    {
                        name: `${Utility.translate(guild?.language, "config/cfg:PIN_CHANNEL")}`,
                        value: `${Utility.translate(guild?.language, "config/cfg:PIN_CHANNEL_DESC")} - ${guild?.config?.pin_channel ? `<#${guild?.config?.pin_channel}>` : `\`${Utility.translate(guild?.language, "common:NONE")}\``}`,
                        inline: false
                    },
                    {
                        name: `${Utility.translate(guild?.language, "config/cfg:TAG_RESTRICTION")}`,
                        value: `${Utility.translate(guild?.language, "config/cfg:TAG_RESTRICTION_DESC")} - ${guild?.config?.pin_channel ? `<@&${guild?.config?.tag_restrict}>` : `\`${Utility.translate(guild?.language, "common:NONE")}\``}`,
                        inline: false
                    },
                    {
                        name: `${Utility.translate(guild?.language, "config/cfg:LEVEL_TOGGLE")}`,
                        value: `${Utility.translate(guild?.language, "config/cfg:LEVEL_TOGGLE_DESC")} - ${guild?.config?.pin_channel ? `\`${Utility.translate(guild?.language, "common:YES")}\`` : `\`${Utility.translate(guild?.language, "common:NO")}\``}`,
                        inline: false
                    }  
            ]);

            return cmd.reply({embeds: [embed], ephemeral: true})
        } else if (sub === "modlog") {
            const channel = cmd.options.getChannel("channel") as TextChannel | null;
            if(!channel) {
                await client.handlers.guilds.edit(cmd.guild!, {mod_log: null});
                return cmd.reply({embeds: [EmbedFactory.generateInfoEmbed(`${Utility.translate(guild?.language, "common:SUCCESS")}`, `${Utility.translate(guild?.language, "config/cfg:MODLOG_SET", {channel: Utility.translate(guild?.language, "common:NONE")})}`)]});
            }
            
            
            if(!channel.isText()) {
                return cmd.reply(Utility.translate(guild?.language, "config/cfg:INVALID_CHANNEL"));
            }
            
            await client.handlers.guilds.edit(cmd.guild!, {mod_log: channel.id});
            return cmd.reply({embeds: [EmbedFactory.generateInfoEmbed(`${Utility.translate(guild?.language, "common:SUCCESS")}`, `${Utility.translate(guild?.language, "config/cfg:MODLOG_SET", {channel: channel.toString()})}`)]});
        
        } else if (sub === "prefix") {
            
            const prefix = cmd.options.getString("prefix") as string | null;
            if(!prefix) {
                return cmd.reply({embeds: [
                    EmbedFactory.generateInfoEmbed(
                        `${Utility.translate(
                            guild?.language,
                            "common:SUCCESS"
                        )}`,
                        `${Utility.translate(
                            guild?.language,
                            "config/cfg:CURRENT_VALUE",
                            {key: 'prefix', value: guild?.prefix}
                        )}`)
                ]})
            }
            await this.client.handlers.guilds.edit(cmd.guild!, {prefix})
            return cmd.reply({embeds: [
                EmbedFactory.generateInfoEmbed(
                    `${Utility.translate(
                        guild?.language,
                        "common:SUCCESS"
                    )}`,
                    `${Utility.translate(
                        guild?.language,
                        "config/cfg:PREFIX_CHANGED",
                        {prefix}
                    )}`)
                ]})
        } else if (sub === "pinchannel") {
            const channel = cmd.options.getChannel("channel") as TextChannel | null;
            if(!channel) {
                await client.handlers.guilds.editConfig(cmd.guild!, {pin_channel: null});
                return cmd.reply({embeds: [EmbedFactory.generateInfoEmbed(`${Utility.translate(guild?.language, "common:SUCCESS")}`, `${Utility.translate(guild?.language, "config/cfg:PIN_CHANNEL_SET", {channel: Utility.translate(guild?.language, "common:NONE")})}`)]});
            }
            
            if(!channel?.isText()) {
                return cmd.reply(Utility.translate(guild?.language, "config/cfg:INVALID_CHANNEL"));
            }
            
            await client.handlers.guilds.editConfig(cmd.guild!, {pin_channel: channel.id});
            return cmd.reply({embeds: [EmbedFactory.generateInfoEmbed(`${Utility.translate(guild?.language, "common:SUCCESS")}`, `${Utility.translate(guild?.language, "config/cfg:PIN_CHANNEL_SET", {channel: channel.toString()})}`)]});
        
        } else if (sub === "level_toggle") {
            const toggled = (await client.handlers.guilds.editConfig(cmd.guild!, {leveling: cmd.options.getBoolean("enable") ?? false}))?.config?.leveling;
            return cmd.reply({embeds: [
                EmbedFactory.generateInfoEmbed(`${Utility.translate(guild?.language, "common:SUCCESS")}`, `${Utility.translate(guild?.language, `config/cfg:LEVELING_TOGGLE_${toggled ? 'ON' : 'OFF'}`)}`)
            ]})
        }
        
        
    }
}
