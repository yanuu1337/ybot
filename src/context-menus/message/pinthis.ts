import { ContextMenuCommandBuilder } from "@discordjs/builders";
import { ContextMenuInteraction, CacheType, MessageContextMenuInteraction, UserContextMenuInteraction } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import ContextMenu from "../../lib/structures/ContextMenu";
import { GuildInterface } from "../../lib/types/database";

export default class extends ContextMenu {
    name = 'Pin this message'
    data = new ContextMenuCommandBuilder()
    async execute(client: ArosClient, interaction: ContextMenuInteraction<CacheType> | MessageContextMenuInteraction<CacheType> | UserContextMenuInteraction<CacheType>, guild: GuildInterface | null, isInDms?: boolean): Promise<any> {
        interaction.reply({content: 'Not available yet.', ephemeral: true})
    }
}