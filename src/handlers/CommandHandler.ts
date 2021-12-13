import { lstat, readdir } from 'fs/promises';
import { join } from 'path';
import { Collection } from 'discord.js';
import ArosClient from '../extensions/ArosClient';
import Command from '../lib/structures/Command';
export default class CommandHandler extends Collection<string, Command> {
    client: ArosClient;
    constructor(client: ArosClient) {
        super();
        this.client = client;
        
        this.init('../commands').catch(err => client.logger.error(`Error:`, err)).then(() => this.client.logger.info(`Successfully loaded ${this.size} commands!`))
    }

    private async init(dir: string) {
        const filePath = join(__dirname, dir);
        const files = await readdir(filePath);
        for(const file of files) {
            if ((await lstat(join(filePath, file))).isDirectory()) this.init(join(dir, file));
            if(file?.endsWith('.js') && !file?.endsWith('.dev.js')) {
                const {default: Command} = await import(join(dir, file))
                
                const command = new Command(this.client, file.replace('.js', ''), join(dir, file));
                this.set(file.replace('.js', ''), command);
            }
        }
        return this;
    }

    fetch(name: string) {
        if(this.has(name)) return this.get(name) as Command;

        const commandAlias = this.find((cmd) => cmd.aliases.includes(name)) as Command | null;
        if(commandAlias) return commandAlias;
        return null;
    }
}  