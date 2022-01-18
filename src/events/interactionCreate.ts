import { ContextMenuInteraction, NewsChannel, TextChannel, ThreadChannel } from 'discord.js';
import { GuildMember } from 'discord.js';
import { Interaction, CommandInteraction } from 'discord.js';
import ArosClient from '../extensions/ArosClient';
import Event from '../lib/structures/Event'
import EmbedFactory from '../util/EmbedFactory';
import Utility from '../util/Utility';
export default class extends Event {
    async execute(client: ArosClient, interaction: Interaction) {
        if(interaction.isCommand()) this.handleCommands(client, interaction)
        if(interaction.isContextMenu()) this.handleContextMenus(client, interaction)
    }
    

    async handleContextMenus(client: ArosClient, interaction: ContextMenuInteraction) {
        if(!interaction.user.id) await interaction.user.fetch(true)
        const menu = client.handlers.menus.fetch(interaction.commandName);
        const user = await this.client.handlers.users.fetchOrCreate(interaction.user)
        

        if(interaction.inGuild()) {
            const guild = await this.client.handlers.guilds.fetchOrCreate(interaction.guild!)
            const member = interaction.member as GuildMember
            const channel = interaction.channel as TextChannel | ThreadChannel | NewsChannel
           

            try {
                
                if(!menu) throw new Error(`Context menu ${interaction.commandName} was not found!`)
                if(!menu.permissions) return menu?.execute(client, interaction, guild)
                if(menu.permissions && (member.permissions?.has(menu.permissions) || channel.permissionsFor(member)?.has(menu.permissions))) {
                    return menu?.execute(client, interaction, guild)
                } else {
                    return interaction.reply({
                        embeds: [
                            EmbedFactory.generateErrorEmbed(
                                `${Utility.translate(user?.language, 'common:ERROR')}`,
                                `${Utility.translate(user?.language, 'common:USER_MISSING_PERMS', {roles: menu.permissions?.join(', ')})}`
                            )
                        ],
                        ephemeral: true
                    })
                }
    
            } catch (err) {
                this.client.logger.error(`Command execution error`, err, () => {})
                if(interaction.ephemeral) return;
                if(interaction.replied) return interaction.editReply({embeds: [EmbedFactory.generateErrorEmbed(`${Utility.translate(`${guild?.language}`, 'common:ERROR')}`, `${Utility.translate(`${guild?.language}`, 'misc:ERROR_OCURRED')}`)]})
                interaction.reply({embeds: [EmbedFactory.generateErrorEmbed(`${Utility.translate(`${guild?.language}`, 'common:ERROR')}`, `${Utility.translate(`${guild?.language}`, 'misc:ERROR_OCURRED')}`)]})
            }

        }


        
        try {
            menu?.execute(client, interaction, null, true)

        } catch (err) {
            this.client.logger.error(`Command execution error`, err, () => {})
            if(interaction.ephemeral) return;
            if(interaction.replied) return interaction.editReply({embeds: [EmbedFactory.generateErrorEmbed(`${Utility.translate(`${user?.language}`, 'common:ERROR')}`, `${Utility.translate(`${user?.language}`, 'misc:ERROR_OCURRED')}`)]})
            interaction.reply({
                embeds: [
                    EmbedFactory.generateErrorEmbed(
                        `${Utility.translate(`${user?.language}`, 'common:ERROR')}`, 
                        `${Utility.translate(`${user?.language}`, 'misc:ERROR_OCURRED')}`
                    )
                ]
            })
        }





        
    }

    async handleCommands(client: ArosClient, interaction: CommandInteraction) {
        client.countsToday.commands++;

        const command = client.handlers.commands.filter(cmd => cmd.isSlashCommand).get(interaction.commandName)
        if(!interaction.user.id) await interaction.user.fetch(true)
        const user = await this.client.handlers.users.fetchOrCreate(interaction.user)

        if(interaction.inGuild()) {
            const member = interaction.member as GuildMember
            const channel = interaction.channel as TextChannel | ThreadChannel | NewsChannel
            const guild = await this.client.handlers.guilds.fetch(interaction.guild!, true)
            if(!guild) {
                this.client.handlers.guilds.create({
                    discord_id: interaction.guild!.id,
                    language: 'en-US',
                })
            }
            try {
                if(!command) throw new Error(`Slash command ${interaction.commandName} was not found!`)
                if(command.permissions && (member.permissions?.has(command.permissions) || channel.permissionsFor(member)?.has(command.permissions))) {
                    command?.executeSlash(client, interaction, guild)
                } else {
                    return interaction.reply({
                        embeds: [
                            EmbedFactory.generateErrorEmbed(
                                `${Utility.translate(user?.language, 'common:ERROR')}`,
                                `${Utility.translate(user?.language, 'common:USER_MISSING_PERMS', {roles: command.permissions?.join(', ')})}`
                            )
                        ],
                        ephemeral: true
                    })
                }
    
            } catch (err) {
                this.client.logger.error(`Command execution error`, err, () => {})
                if(interaction.ephemeral) return;
                if(interaction.replied) return interaction.editReply({embeds: [EmbedFactory.generateErrorEmbed(`${Utility.translate(`${guild?.language}`, 'common:ERROR')}`, `${Utility.translate(`${guild?.language}`, 'misc:ERROR_OCURRED')}`)]})
                interaction.reply({embeds: [EmbedFactory.generateErrorEmbed(`${Utility.translate(`${guild?.language}`, 'common:ERROR')}`, `${Utility.translate(`${guild?.language}`, 'misc:ERROR_OCURRED')}`)]})
            }
            return;
        }

        try {
            if(!command?.dm) return interaction.reply({embeds: [EmbedFactory.generateErrorEmbed(`${Utility.translate(user?.language, 'common:ERROR')}`, `${Utility.translate(user?.language, `misc:COMMAND_NOT_DM`)}`)]})
            command?.executeSlash(client, interaction, null, true)

        } catch (err) {
            this.client.logger.error(`Command execution error`, err, () => {})
            if(interaction.ephemeral) return;
            if(interaction.replied) return interaction.editReply({embeds: [EmbedFactory.generateErrorEmbed(`${Utility.translate(`${user?.language}`, 'common:ERROR')}`, `${Utility.translate(`${user?.language}`, 'misc:ERROR_OCURRED')}`)]})
            interaction.reply({embeds: [EmbedFactory.generateErrorEmbed(`${Utility.translate(`${user?.language}`, 'common:ERROR')}`, `${Utility.translate(`${user?.language}`, 'misc:ERROR_OCURRED')}`)]})
        
        }
    }
}