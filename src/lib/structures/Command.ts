import { CommandInteraction, Message, PermissionString } from 'discord.js';
import ArosClient from "../../extensions/ArosClient";
import { GuildInterface } from '../types/database';
import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from '@discordjs/builders'
export default class Command {
    client: ArosClient;
    name: string;
    description?: string;
    category: string;
    usage?: string;
    aliases: string[] = [];
    devOnly: boolean = false;
    isSlashCommand: boolean = false;
    permissions?: PermissionString[] = []
    botPermissions?: PermissionString[] = ['SEND_MESSAGES', 'VIEW_CHANNEL']
    data?: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    dm: boolean = false;
    
    constructor(client: ArosClient, name: string, path: string) {
        this.client = client;
        this.name = name;
        if(!this.usage) this.usage = this.name;
        this.category = path;
    }
    
    async execute(client: ArosClient, message: Message, args: string[], guild: GuildInterface | null): Promise<any> {
        
    }

    async executeSlash(client: ArosClient, interaction: CommandInteraction, guild: GuildInterface | null, isInDms: boolean = false): Promise<any> {

    }

    get commandData() {
        if(!this.description) this.description = this.name
        return this.data?.setName(this.name).setDescription(this.description!)
    }


}