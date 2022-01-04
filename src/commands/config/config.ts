import { Message } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";
import EmbedFactory from "../../util/EmbedFactory";
import Utility from "../../util/Utility";

export default class extends Command {
    async execute(client: ArosClient, msg: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        //TODO Prefixes, other stuff
        if(!args[0]) {
            const embed = EmbedFactory.generateInfoEmbed(`${Utility.translate(guild?.language, "common:SUCCESS")}`, `${Utility.translate(guild?.language, "config/cfg:INFO")}`);
            embed.fields = [
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
                    value: `${Utility.translate(guild?.language, "config/cfg:MODLOG_DESC")} - \`${guild?.mod_log}\`` ?? Utility.translate(guild?.language, "common:NONE"),
                    inline: false
                }
                
            ]
            return msg.reply({embeds: [embed]})
        }
        const configKeys = ["language", "autorole", "modlog", "prefix"]
        //check if args[0] is a valid config value
        if(!configKeys.includes(args[0])) {
            return msg.reply(Utility.translate(guild?.language, "config/cfg:INVALID_ARG", {key: args[0], keys: configKeys.map((val) => `\`${val}\``).join(', ')}));
        }
        const argument = args[0].replace('modlog', 'mod_log') as keyof GuildInterface;

        if(args[0] && !args[1]) {
            return msg.reply({embeds: [
                EmbedFactory.generateInfoEmbed(
                    `${Utility.translate(
                        guild?.language,
                        "common:SUCCESS"
                    )}`,
                    `${Utility.translate(
                        guild?.language,
                        "config/cfg:CURRENT_VALUE",
                        {key: args[0], value: guild?.[argument]}
                    )}`)
            ]})
        }

        if(args[0] === "language") {
            if(!["en", "pl"].includes(args[1])) {
                return msg.reply(Utility.translate(guild?.language, "config/cfg:INVALID_LANGUAGE"));
            }
            await client.handlers.guilds.edit(msg.guild!, {language: args[1]});
            return msg.reply({embeds: [EmbedFactory.generateInfoEmbed(`${Utility.translate(guild?.language, "common:SUCCESS")}`, `${Utility.translate(guild?.language, "config/cfg:LANGUAGE_CHANGED", {lang: args[1]})}`)]});
        
        } else if(args[0] === "autorole") {
            
            if(!["true", "false"].includes(args[1])) {
                return msg.reply(Utility.translate(guild?.language, "config/cfg:INVALID_ARG"));
            }
            await client.handlers.guilds.edit(msg.guild!, {autoroles: {active: args[1] === "true"}});
            return msg.reply({embeds: [EmbedFactory.generateInfoEmbed(`${Utility.translate(guild?.language, "common:SUCCESS")}`, `${Utility.translate(guild?.language, "config/cfg:AUTOROLE_CHANGED", {active: args[1] === "true" ? Utility.translate(guild?.language, "common:YES") : Utility.translate(guild?.language, "common:NO")})}`)]});
        
        } else if(args[0] === "modlog") {
            
            if(!args[1] || args[1] === "none" || args[1] === "null") {
                await client.handlers.guilds.edit(msg.guild!, {mod_log: null});
                return msg.reply({embeds: [EmbedFactory.generateInfoEmbed(`${Utility.translate(guild?.language, "common:SUCCESS")}`, `${Utility.translate(guild?.language, "config/cfg:MODLOG_CHANGED", {channel: Utility.translate(guild?.language, "common:NONE")})}`)]});
            }
            
            const channel = msg.mentions.channels.first() || msg.guild?.channels.cache.find(c => c.id === args[1] || c.toString() === args[1]);
            
            if(!channel) {
                return msg.reply(Utility.translate(guild?.language, "config/cfg:INVALID_CHANNEL"));
            }
            
            await client.handlers.guilds.edit(msg.guild!, {mod_log: channel.id});
            return msg.reply({embeds: [EmbedFactory.generateInfoEmbed(`${Utility.translate(guild?.language, "common:SUCCESS")}`, `${Utility.translate(guild?.language, "config/cfg:MODLOG_CHANGED", {channel: channel.toString()})}`)]});
        
        } else if (args[0] === "prefix") {
            if(!msg.member?.permissions?.has('MANAGE_GUILD', true)) return msg.reply(`You don't have the \`MANAGE_GUILD\` to change the prefix.`)
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
        } else {
            return msg.reply(Utility.translate(guild?.language, "config/cfg:INVALID_ARG"));
        }

    }
}