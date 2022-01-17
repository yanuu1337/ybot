import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, Collection, CommandInteraction, Message, MessageEmbed, PermissionString } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";

export default class extends Command {
    permissions = ['MANAGE_GUILD'] as PermissionString[];
    data = new SlashCommandBuilder().addSubcommand(sub =>
        sub.setName('create').setDescription('Create a tag.').addStringOption(opt => opt.setName('name').setRequired(true).setDescription('The name of the tag.'))
    ).addSubcommand(sub =>
        sub.setName('delete').setDescription('Delete a tag.').addStringOption(opt => opt.setName('name').setRequired(true).setDescription('The name of the tag.'))
    ).addSubcommand(sub =>
        sub.setName('send').setDescription('Send a tag.').addStringOption(opt => opt.setName('name').setRequired(true).setDescription('The name of the tag.')).addMentionableOption(opt => opt.setName('target').setDescription('Optional target of the tag.'))
    )
    dm = false;
    description = 'Manage tags.';
    usage = 'tag <create|delete|send> <name> [target]';
    isSlashCommand = true;
    
    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        if(args[0].toLowerCase() === "create") {
            return this.createTag(client, message, args.slice(1), guild);
        } else if (args[0].toLowerCase() === "delete" || args[0].toLowerCase() === "remove") {
            return this.removeTag(client, message, args.slice(1), guild);
        } else {
            return client.handlers.tags.fetch({discord_id: message.guild?.id, tag: args[0].toLowerCase()}).then(tag => {
                if(!tag) return message.channel.send(`Tag \`${args[0]}\` not found.`);
                console.log(tag);
                return message.channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setTitle(`\`${tag.tag}\``)
                            .setColor("RANDOM")
                            .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL()})
                            .setDescription(`${tag.content}`).setFooter({text: `© ${new Date().getFullYear()} - Aros | created by ${tag.author?.toString()}`})
                    ]
                })
            })
        }
        

        
    }


        
    async executeSlash(client: ArosClient, interaction: CommandInteraction<CacheType>, guild: GuildInterface | null, isInDms?: boolean): Promise<any> {
        const sub = interaction.options.getSubcommand() as 'create' | 'delete' | 'send';
        if(sub === 'create') {
            return this.createTag(client, interaction, [interaction.options.getString('name', true)], guild);
        } else if (sub === 'delete') {
            return this.removeTag(client, interaction, [interaction.options.getString('name', true)], guild);
        }
        const tag = await client.handlers.tags.fetch({discord_id: interaction.guild?.id, tag: interaction.options.getString('name', true).toLowerCase()});
        if(!tag) return interaction.reply({content: "Tag doesn't exist!", ephemeral: true});
        interaction.reply({
            content: `${interaction.options.getMentionable('target') ? `Tag suggestion for ${interaction.options.getMentionable('target')}` : ''}`,
            embeds: [
                new MessageEmbed()
                    .setTitle(`\`${tag.tag}\``)
                    .setColor("RANDOM")
                    .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
                    .setDescription(`${tag.content}`).setFooter({text: `© ${new Date().getFullYear()} - Aros | created by ${tag.author?.toString()}`})
            ]
        })
    }


    async createTag(client: ArosClient, message: Message | CommandInteraction, args: string[], guild: GuildInterface | null): Promise<any> {
        const shouldBeEphemeral = message instanceof CommandInteraction ? {ephemeral: true} : {};
        if(!guild || !message?.channel) return message.reply({content: "You are not in a guild!", ...shouldBeEphemeral});
        if(!args[0]) return message.reply({content: "Please provide a tag name!", ...shouldBeEphemeral});
        const illegalCharacters = ["<", ">", ":", ";", ",", ".", "?", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "{", "}", "[", "]", "|", "\\", "/", "`", "~", "\"", "'", " "];

        if(illegalCharacters.some(char => args[0].includes(char))) return message.reply({
            content: `Tag name contains illegal characters, such as ${illegalCharacters.map(val => `\`${val}\``).join(', ')}!`,
             ...shouldBeEphemeral
        });
        
        if(args[0].length > 32) return message.reply({content: "Tag name is too long! Please enter a tag name under 32 characters.", ...shouldBeEphemeral});
        if(args[0].length < 2) return message.reply({content: "Tag name is too short! Please enter a tag name at least 2 characters long.", ...shouldBeEphemeral});
        const tagExists = await client.handlers.tags.fetch({discord_id: message.guild?.id, tag: args[0].toLowerCase()});
        if(tagExists) return message.reply("Tag already exists!");
        
        
        const filter = (msg: Message<boolean>) => msg.author.id === msg.author.id;
        const collector = message.channel?.createMessageCollector({filter, time: 60000, max: 1});
        message.reply("Please provide the content of the tag!");
        collector.on('collect', (msg: Message<boolean>): any => {
            if(msg.content.toLowerCase() === 'cancel') {
                msg.reply(`Cancelled creating tag ${args[0]}`);
                return;
            }
            if(msg.content.length > 1024) return msg.reply("Tag content is too long!");
            if(msg.content.length < 2) return msg.reply("Tag content is too short!");
            collector.stop();
            client.handlers.tags.create({discord_id: msg.guild?.id, tag: args[0].toLowerCase(), content: msg.content, author: {id: msg.author.id, tag: msg.author.tag}});
            msg.reply(`Tag ${args[0]} created! Preview it using \`${guild?.prefix}tag ${args[0]}\``);
        })

        collector.on('end', (collected: Collection<string, Message<boolean>>): any => {
            if(!collected.size) return message.reply({content: `Tag creation cancelled!`, ...shouldBeEphemeral});
        })

    }

    async removeTag(client: ArosClient, message: Message | CommandInteraction, args: string[], guild: GuildInterface | null): Promise<any> {
        const shouldBeEphemeral = message instanceof CommandInteraction ? {ephemeral: true} : {};

        const tagExists = await client.handlers.tags.fetch({discord_id: message.guild?.id, tag: args[0].toLowerCase()});
        if(!tagExists) return message.reply({content: "Tag doesn't exist!", ...shouldBeEphemeral});
        await client.handlers.tags.delete({discord_id: message.guild?.id, tag: args[0].toLowerCase()});
        return message.reply(`Tag ${args[0]} deleted!`);


    }
}