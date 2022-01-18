import { lstat, readdir } from 'fs/promises';
import { join } from 'path';
import { Collection } from 'discord.js';
import ArosClient from '../extensions/ArosClient';
import ContextMenu from '../lib/structures/ContextMenu';
export default class ContextMenuHandler extends Collection<string, ContextMenu> {
    client: ArosClient;
    constructor(client: ArosClient) {
        super();
        this.client = client;
        
        this.init('../context-menus').catch(err => client?.logger?.error(`Error:`, err)).then(() => client?.logger?.info(`Successfully loaded ${this.size} commands!`));

    }

    private async init(dir: string) {
        const filePath = join(__dirname, dir);
        const files = await readdir(filePath);
        for(const file of files) {
            if ((await lstat(join(filePath, file))).isDirectory()) this.init(join(dir, file));
            if(file?.endsWith('.js') && !file?.endsWith('.dev.js')) {
                const {default: ContextMenu} = await import(join(dir, file))
                
                const menu = new ContextMenu(this.client, file.replace('.js', ''), dir.replace('..\\context-menus\\', ''));
                this.set(menu.name, menu);
            }
        }
        return this;
    }

    fetch(name: string) {
        if(this.has(name)) return this.get(name) as ContextMenu;
        return null;
    }
}  