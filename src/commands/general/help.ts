
import { CacheType, CommandInteraction, Message, MessageActionRow, MessageEmbed, MessageSelectMenu, SelectMenuInteraction } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";
import EmbedFactory from "../../util/EmbedFactory";
import Utility from "../../util/Utility";

const capitalize = (s: string) => {
    return s.charAt(0).toUpperCase() + s.slice(1)
}
export default class extends Command {
    description = "Display a help message.";
    usage = 'help [command|category]';

   
    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        const user = await client.handlers.users.fetchOrCreate(message.author);

        const categories: {
            [key: string]: Command[]
        } = {
            "General": [],
            "Moderation": [],
            "Config": [],
            "Utility": [],
            "Fun": [],
            "NSFW": [],
        };
        for (const command of client.handlers.commands.values()) {
            if (command.category) {
                if(command.category === 'admin') continue;
                categories[capitalize(command.category)].push(command);
            } else {
                categories['General'].push(command);
            }
        }
        if(args[0]) {
            //get command
            const command = client.handlers.commands.get(args[0]) || client.handlers.commands.find(c => c.aliases.includes(args[0]))
            if(!command) return message.reply({
                embeds: [
                    EmbedFactory.generateErrorEmbed(`${Utility.translate(user?.language, `common:ERROR`)}`, `${Utility.translate(user?.language, `info/help:QUERY_NOT_FOUND`, {query: args[0]})}`)
                ]
            })
            const embed = new MessageEmbed()
                .setTitle(`${Utility.translate(user?.language, `info/help:HELP`)} ${command.name}`)
                .setDescription(`${command.description ?? 'No description'}`)
                .addField(`${Utility.translate(user?.language, `info/help:USAGE`)}`, `\`${command.usage ?? 'No usage.'}\``)
                .addField(`${Utility.translate(user?.language, `info/help:CATEGORY`)}`, `\`${capitalize(command.category)}\``)
                .addField(`${Utility.translate(user?.language, `info/help:IS_SLASH_COMMAND`)}`, `\`${command.isSlashCommand ? Utility.translate(user?.language, `common:YES`) : Utility.translate(user?.language, `common:NO`)}\``)
                .setColor(0x00AE86)
                .setFooter(`© ${new Date().getFullYear()} - yBot 🎉`)
                .setTimestamp();
                
            if(command.aliases.length) embed.addField(`${Utility.translate(user?.language, `info/help:ALIASES`)}`, `${command.aliases.map(val => `\`${val}\``).join(', ')}`)
            if(command.permissions && command.permissions?.length > 0) embed.addField(`${Utility.translate(user?.language, `info/help:REQUIRED_PERMS`)}`, `${command.permissions.map(val => `\`${val}\``).join(', ')}`)
            if(command.botPermissions && command.botPermissions?.length > 0) embed.addField(`${Utility.translate(user?.language, `info/help:BOT_REQUIRED_PERMS`)}`, `${command.botPermissions.map(val => `\`${val}\``).join(', ')}`)
            return message.reply({
                embeds: [embed]
            })

        }

        const allEmbeds = Object.keys(categories).map(category => {
            const commands = categories[capitalize(category)];
            const fields = commands.length <= 0 ? [{name: `No commands!`, value: `There are no commands in this category`}] : commands.map(cmd => {
                return {
                    name: `${cmd.name}`,
                    value: `${cmd.description ?? 'No description'}
                    **${Utility.translate(user?.language, `info/help:USAGE`)}:** \`${cmd.usage}\` ${cmd.aliases.length ? `\n**${Utility.translate(user?.language, `info/help:ALIASES`)}:** ${cmd.aliases.map(val => `\`${val}\``).join(', ')}` : ''} 
                    ${cmd.permissions?.length ? `**${Utility.translate(user?.language, `info/help:REQUIRED_PERMS`)}**: ${cmd.permissions.map(val => `\`${val}\``).join(', ')}` : ''}
                    ${cmd.botPermissions?.length ? `**${Utility.translate(user?.language, `info/help:BOT_REQUIRED_PERMS`)}**: ${cmd.botPermissions.map(val => `\`${val}\``).join(', ')}` : ''}
                    
                    `,
                    inline: true
                }
            })
            
            return {
                title: category,
                embed: new MessageEmbed({
                    title: `Help - ${capitalize(category)}`,
                    description: `${Utility.translate(user?.language, `info/help:HELP_DESCRIPTION`, {prefix: guild?.prefix})}`,
                    fields,
                    footer: {
                        text: `${commands.length} command(s) in this category`,
                        icon_url: client.user?.avatarURL() ?? undefined
                    },
                    color: 'AQUA'
                })
            }



        })


        const msg = await message.reply({
            content: `Use the select menu below to navigate through the help menu!`,
            components: [row], embeds: [
            allEmbeds.find(val => val.title.toLowerCase() === 'general')?.embed!
        ]}).catch(err => null);

        const collector = msg?.createMessageComponentCollector({time: 60_000, componentType: "SELECT_MENU"});

        collector?.on('collect', (cmd: SelectMenuInteraction) => {
            
            if(!cmd.isSelectMenu()) return;
            if(cmd.user.id !== message.author.id) return cmd.reply({content: `This interactoin is not for you!`, ephemeral: true});
            const embed = allEmbeds.find(val => val.title.toLowerCase() === cmd.values[0])?.embed!;
            cmd.update({
                content: null,
                embeds: [embed],
            }).catch(err => null)
                
        })
        collector?.on('end', (collected, reason) => {
            msg?.edit({content: `*The help menu has expired.*`, components: []});
        })


        
        
    }

    
    async executeSlash(client: ArosClient, interaction: CommandInteraction<CacheType>, guild: GuildInterface | null, isInDms?: boolean): Promise<any> {


        const sub = interaction.options.getSubcommand(true) as "general" | "config" | "moderation" | "utility" | "fun" | "nsfw" | "command";
        const user = await client.handlers.users.fetchOrCreate(interaction.user);

        if(sub === 'command') {
            const command = this.client.handlers.commands.find(val => val.name === interaction.options.getString('command'));
            if(!command) return interaction.reply({content: `Command not found!`, ephemeral: true});
            return interaction.reply({
                embeds: [
                    new MessageEmbed({
                        title: `Help - ${command.name}`,
                        description: `${command.description ?? 'No description'}
                        **${Utility.translate(user?.language, `info/help:USAGE`)}:** \`${command.usage}\` ${command.aliases.length ? `\n**${Utility.translate(user?.language, `info/help:ALIASES`)}:** ${command.aliases.map(val => `\`${val}\``).join(', ')}` : ''}
                        ${command.permissions?.length ? `**${Utility.translate(user?.language, `info/help:REQUIRED_PERMS`)}**: ${command.permissions.map(val => `\`${val}\``).join(', ')}` : ''}
                        ${command.botPermissions?.length ? `**${Utility.translate(user?.language, `info/help:BOT_REQUIRED_PERMS`)}**: ${command.botPermissions.map(val => `\`${val}\``).join(', ')}` : ''}
                        `
                    })
                ], ephemeral: true
            })
        }
        
        const categories: {
            [key: string]: Command[]
        } = {
            "General": [],
            "Moderation": [],
            "Config": [],
            "Utility": [],
            "Fun": [],
            "NSFW": [],
        };
        for (const command of client.handlers.commands.values()) {
            if (command.category) {
                if(command.category === 'admin') continue;
                if(command.category === 'nsfw') {
                    categories['NSFW'].push(command);
                    continue;
                }
                categories[capitalize(command.category)].push(command);
            } else {
                categories['General'].push(command);
            }
        }
        const commands = sub === "nsfw" ? categories['NSFW'] : categories[capitalize(sub)];
        const fields = commands.length <= 0 ? [{name: `No commands!`, value: `There are no commands in this category`}] : commands.map(cmd => {
            return {
                name: `${cmd.name}`,
                value: `${cmd.description ?? 'No description'}
                **${Utility.translate(user?.language, `info/help:USAGE`)}:** \`${cmd.usage}\` ${cmd.aliases.length ? `\n**${Utility.translate(user?.language, `info/help:ALIASES`)}:** ${cmd.aliases.map(val => `\`${val}\``).join(', ')}` : ''} 
                ${cmd.permissions?.length ? `**${Utility.translate(user?.language, `info/help:REQUIRED_PERMS`)}**: ${cmd.permissions.map(val => `\`${val}\``).join(', ')}` : ''}
                ${cmd.botPermissions?.length ? `**${Utility.translate(user?.language, `info/help:BOT_REQUIRED_PERMS`)}**: ${cmd.botPermissions.map(val => `\`${val}\``).join(', ')}` : ''}
                
                `,
                inline: true
            }
        })

        const embed = new MessageEmbed({
            title: `Help - ${capitalize(sub)}`,
            description: `${Utility.translate(user?.language, `info/help:HELP_DESCRIPTION`, {prefix: guild?.prefix})}`,
            fields,
            footer: {
                text: `${interaction.options.getSubcommand(true)?.length} command(s) in this category`,
                icon_url: client.user?.avatarURL() ?? undefined
            },
            color: 'AQUA'
        })
        interaction.reply({embeds: [embed], ephemeral: true});
    }

}



const row = new MessageActionRow()
    .addComponents(
        new MessageSelectMenu()
            .setCustomId("msg_help_menu")
            .setMinValues(0)
            .setPlaceholder("Select a category")
            .addOptions([
                {
                    "label": "General",
                    "value": "general",
                    description: "General commands",
                    emoji: "<:info:936671971771551784>",
                },
                {
                    "label": "Moderation",
                    "value": "moderation",
                    description: "Moderation commands",
                    emoji: "<:moderation:936671971687665674>"
                },
                {
                    "label": "Config",
                    "value": "config",
                    description: "Config commands",
                    emoji: "<:config:936671971821883392>"
                },
                {
                    "label": "Utility",
                    "value": "utility",
                    description: "Utility commands",
                    emoji: "⚒️"
                },
                {
                    "label": "Fun",
                    "value": "fun",
                    description: "Fun commands",
                    emoji: "<:gamepad:936672734061166635>"
                },
                {
                    "label": "NSFW",
                    "value": "nsfw",
                    description: "NSFW commands",
                    emoji: "<:nsfw:936673248140230686>"
                }
            ])
    )