import { ContextMenuInteraction, MessageContextMenuInteraction, PermissionString, UserContextMenuInteraction } from 'discord.js';
import ArosClient from "../../extensions/ArosClient";
import { GuildInterface } from '../types/database';
import {  ContextMenuCommandBuilder } from '@discordjs/builders'
export default class ContextMenu {
    client: ArosClient;
    name: string;
    description?: string;
    type?: 'MESSAGE' | 'USER' | string;
    permissions?: PermissionString[] = []
    botPermissions?: PermissionString[] = []
    data?: ContextMenuCommandBuilder = new ContextMenuCommandBuilder();
    dm: boolean = false;
    
    constructor(client: ArosClient, name: string, path: string) {
        this.client = client;
        this.name = name;
        if(!this.data) this.data = this.contextMenuData;
        this.type = path.toUpperCase() as 'MESSAGE' | 'USER';
        if(!this.description) this.description = this.name;
    }
    
    async execute(client: ArosClient, interaction: ContextMenuInteraction | MessageContextMenuInteraction | UserContextMenuInteraction, guild: GuildInterface | null, isInDms: boolean = false): Promise<any> {

    }

    get contextMenuData() {
        return this.data?.setName(this.name).setType(this.type === "MESSAGE" ? 3 : 2)
    }


}