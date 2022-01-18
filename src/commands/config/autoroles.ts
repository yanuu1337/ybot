import {  SlashCommandBuilder } from '@discordjs/builders';
import { GuildInterface } from './../../lib/types/database';
import { CacheType, CommandInteraction, Message, PermissionString, Role } from 'discord.js';
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import EmbedFactory from '../../util/EmbedFactory';
import Utility from '../../util/Utility';

export default class extends Command {
    category = 'config';
    isSlashCommand = true;
    dm = false;
    usage = 'autoroles [bots|members] [<role>]';
    botPermissions = ['MANAGE_ROLES'] as PermissionString[]
    permissions = ['MANAGE_ROLES'] as PermissionString[]
    description = "Configure roles that will be giving to newcoming users or bots"
    data = new SlashCommandBuilder()
        .addSubcommand(sub => 
            sub.setName("bots").setDescription("Configure bot autoroles").addRoleOption(role => role.setName("role").setDescription("Role to add to bots that join the guild").setRequired(true))
        ).addSubcommand(sub => 
            sub.setName("users").setDescription("Configure user autoroles").addRoleOption(role => role.setName("role").setDescription("Role to add to users that join the guild").setRequired(true))
        ).addSubcommand(sub =>
            sub.setName("view").setDescription("View current user/bot autorole values")
        ).addSubcommand(sub =>
                sub.setName("toggle").setDescription("Enable or disable autoroles"))
    async execute(client: ArosClient, message: Message, args: string[], guild: GuildInterface) {
        if(!guild) throw new Error(`No guild ${this.constructor.name}`);
        if(!args[0]) {
            if(guild?.autoroles) {
                return message.reply({
                    embeds: [
                        EmbedFactory.generateInfoEmbed(
                            `Autoroles`,
                            `${Utility.translate(guild?.language, 'config/autoroles:RESPONSE', {
                                members: guild.autoroles.members ? `<@&${guild.autoroles.members}>` : "None",
                                members_id: guild.autoroles.members ?? 'None',
                                bots: guild.autoroles.bots ? `<@&${guild.autoroles.bots}>`: 'None',
                                bots_id: guild.autoroles.bots ?? 'None',
                                active: guild.autoroles.active})}`
                        )
                    ]
                })
            } else {
                return message.reply({
                    embeds: [
                        EmbedFactory.generateWarningEmbed(
                            `${Utility.translate(guild?.language, 'common:ERROR')}`, 
                            `${Utility.translate(guild?.language, 'config/autoroles:ROLES_NOT_SETUP')}`
                        )
                    ]
                })
            }
        } 

        if(args[0].toLowerCase() === "bots" || args[0].toLowerCase() === "members") {
            if(!args[1]) {
                return message.reply({
                    embeds: [
                        EmbedFactory.generateErrorEmbed(
                            `${Utility.translate(guild?.language, 'common:ERROR')}`,
                            `${Utility.translate(guild?.language, 'config/autoroles:ROLE_NOT_EXISTS')}` 
                        )
                    ]
                }) 
            }
            const role = message.mentions.roles.first() || message.guild?.roles.cache.get(args[1]) || await message.guild?.roles.fetch(args[1]).catch(err => null)
            
            if(role?.comparePositionTo(message.guild?.me?.roles?.highest ?? message.guild?.roles.everyone!)! > 0) {
                return message.reply({
                    embeds: [
                        EmbedFactory.generateErrorEmbed(
                            `${Utility.translate(guild?.language, 'common:ERROR')}`,
                            `${Utility.translate(guild?.language, 'config/autoroles:ROLE_TOO_HIGH')}`
                        )
                    ]
                })
            }
            if(!role) {
                return message.reply({
                    embeds: [
                        EmbedFactory.generateErrorEmbed(
                            `${Utility.translate(guild?.language, 'common:ERROR')}`,
                            `${Utility.translate(guild?.language, 'config/autoroles:ROLE_NOT_EXISTS')}` 
                        )
                    ]
                })
            }
            const autoRoles = {...guild?.autoroles, active: true}
            const newRoles = {}
            //@ts-ignore
            newRoles[`${args[0].toLowerCase()}`] = `${role.id}`
            const res = Object.assign(autoRoles, newRoles);
            await client.handlers.guilds.setAutoRoles(guild?.discord_id!, res)

            return message.reply({
                embeds: [
                    EmbedFactory.generateInfoEmbed(
                        `${Utility.translate(guild?.language, 'common:SUCCESS')}`,
                        `${Utility.translate(guild?.language, 'config/autoroles:SUCCESS', {configured: `${args[0].toLowerCase()}`, toRoleId: role.id})}`
                    )
                ]
            })
        }
       
    }
    async executeSlash(client: ArosClient, interaction: CommandInteraction<CacheType>, guild: GuildInterface | null, isInDms?: boolean): Promise<any> {
        if(!guild) throw new Error(`No guild ${this.constructor.name}`);
        const subcommand = interaction.options.getSubcommand() as "users" | "bots" | "view" | "toggle"
        if(subcommand === "view") {
            if(guild?.autoroles) {
                
                return interaction.reply({
                    embeds: [
                        EmbedFactory.generateInfoEmbed(
                            `Autoroles`,
                            `${Utility.translate(guild?.language, 'config/autoroles:RESPONSE', {
                                members: guild.autoroles.members ? `<@&${guild.autoroles.members}>` : "None",
                                members_id: guild.autoroles.members ?? 'None',
                                bots: guild.autoroles.bots ? `<@&${guild.autoroles.bots}>`: 'None',
                                bots_id: guild.autoroles.bots ?? 'None',
                                active: guild.autoroles.active})}`
                        )
                    ]
                })
            } else {
                return interaction.reply({
                    embeds: [
                        EmbedFactory.generateWarningEmbed(
                            `${Utility.translate(guild?.language, 'common:ERROR')}`, 
                            `${Utility.translate(guild?.language, 'config/autoroles:ROLES_NOT_SETUP')}`
                        )
                    ]
                })
            }
        }
        const role = interaction.options.getRole('role') as Role
        if(role?.comparePositionTo(interaction.guild?.me?.roles?.highest ?? interaction.guild?.roles.everyone!)! > 0) {
            return interaction.reply({
                embeds: [
                    EmbedFactory.generateErrorEmbed(
                        `${Utility.translate(guild?.language, 'common:ERROR')}`,
                        `${Utility.translate(guild?.language, 'config/autoroles:ROLE_TOO_HIGH')}`
                    )
                ]
            , ephemeral: true})
        }
        if(subcommand === "bots") {
            await client.handlers.guilds.setAutoRoles(guild?.discord_id!, {...guild?.autoroles, bots: role.id, active: true})

            return interaction.reply({
                embeds: [
                    EmbedFactory.generateInfoEmbed(
                        `${Utility.translate(guild?.language, 'common:SUCCESS')}`,
                        `${Utility.translate(guild?.language, 'config/autoroles:SUCCESS', {configured: 'bots', toRoleId: role.id})}`
                    )
                ]
            })
        }
        if(subcommand === "users") {
            await client.handlers.guilds.setAutoRoles(guild?.discord_id!, {...guild?.autoroles, members: role.id, active: true})

            return interaction.reply({
                embeds: [
                    EmbedFactory.generateInfoEmbed(
                        `${Utility.translate(guild?.language, 'common:SUCCESS')}`,
                        `${Utility.translate(guild?.language, 'config/autoroles:SUCCESS', {configured: 'members', toRoleId: role.id})}`
                    )
                ]
            })
        }
        if(subcommand === "toggle") {
            await client.handlers.guilds.setAutoRoles(guild?.discord_id!, {...guild?.autoroles, active: !guild?.autoroles?.active})

            return interaction.reply({
                embeds: [
                    EmbedFactory.generateInfoEmbed(
                        `${Utility.translate(guild?.language, 'common:SUCCESS')}`,
                        `${Utility.translate(guild?.language, 'config/autoroles:TOGGLE_SUCCESS', {status: !guild?.autoroles?.active ? 'ON' : 'OFF'})}`
                    )
                ]
            })
        }
    }
}