import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from "discord-api-types/v9";
import ArosClient from '../extensions/ArosClient';

export default class API {
    client: ArosClient;
    rest: REST;
    testGuild?: string;
    constructor(client: ArosClient, testGuild?: string) {
        if(!client || !client.token) throw new Error(`The client is not initialized yet!`)
        this.client = client;
        if(this.client.application) 
        this.testGuild = testGuild;
        this.rest = new REST({version: '9'}).setToken(client.token);
    }
    
    async putSlashCommands(body?: JSON | Object | Array<Object>) {
        const commandValues = [
            ...this.client.handlers.commands.filter(cmd => cmd.isSlashCommand == true).map(cmd => cmd.commandData?.toJSON()),
            ...this.client.handlers.menus.map(menu => menu.contextMenuData?.toJSON())
        ]
        this.rest.put(Routes.applicationCommands(this.client.application?.id!), {body: body ?? commandValues})
        setTimeout(() => this.putGlobalHelpCommand(), 1000);
        return null;
    }

    async putGuildTestSlashCommands(body?: JSON | Object | Array<Object>) {
        const commandValues = [
            ...this.client.handlers.commands.filter(cmd => cmd.isSlashCommand == true).map(cmd => cmd.commandData?.toJSON()),
            ...this.client.handlers.menus.map(menu => menu.contextMenuData?.toJSON())
        ]
        await this.rest.put(Routes.applicationGuildCommands(this.client.application?.id!, '856924300215713833'), {body: body ?? commandValues})
        setTimeout(() => this.putHelpCommand(), 1000);
        return null;
    }
    
    async putHelpCommand() {
        const data = new SlashCommandBuilder().addSubcommand(sub =>
            sub.setName("general").setDescription("General commands")
        ).addSubcommand(sub =>
            sub.setName("config").setDescription("Config commands")
        ).addSubcommand(sub =>
            sub.setName("moderation").setDescription("Moderation commands")
        ).addSubcommand(sub =>
            sub.setName("utility").setDescription("Utility commands")
        ).addSubcommand(sub =>
            sub.setName("fun").setDescription("Fun commands")
        ).addSubcommand(sub =>
            sub.setName("nsfw").setDescription("NSFW commands")
        ).addSubcommand(sub =>
            sub.setName("command").setDescription("Get help on a specific command").addStringOption(opt => opt.setName("command").setDescription("The command to search for").setRequired(true))
        ).setName("help").setDescription("Stop it. Get some help.");
        await this.rest.post(Routes.applicationGuildCommands(this.client.application?.id!, '856924300215713833'), {body: data.toJSON()})
    }

    async putGlobalHelpCommand() {
        const data = new SlashCommandBuilder().addSubcommand(sub =>
            sub.setName("general").setDescription("General commands")
        ).addSubcommand(sub =>
            sub.setName("config").setDescription("Config commands")
        ).addSubcommand(sub =>
            sub.setName("moderation").setDescription("Moderation commands")
        ).addSubcommand(sub =>
            sub.setName("utility").setDescription("Utility commands")
        ).addSubcommand(sub =>
            sub.setName("fun").setDescription("Fun commands")
        ).addSubcommand(sub =>
            sub.setName("nsfw").setDescription("NSFW commands")
        ).addSubcommand(sub =>
            sub.setName("command").setDescription("Get help on a specific command").addStringOption(opt => opt.setName("command").setDescription("The command to search for").setRequired(true))
        ).setName("help").setDescription("Stop it. Get some help.");
        await this.rest.post(Routes.applicationCommands(this.client.application?.id!), {body: data.toJSON()})
    }

    getCommandValues(): [string, string][] {
        return this.client.handlers.commands.filter(cmd => cmd.category !== 'admin').map(val => {
            return [val.name, val.name];
        })
    }

}