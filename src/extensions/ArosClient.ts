import { writeFile } from 'fs/promises';
import { Client, ClientOptions, Intents } from "discord.js"
import { TFunction } from "i18next";
import schedule from 'node-schedule';
import fetch from 'node-fetch';
import CommandHandler from "../handlers/CommandHandler";
import EventHandler from "../handlers/EventHandler";
import GuildHandler from "../handlers/GuildHandler";
import TagHandler from "../handlers/TagHandler";
import UserHandler from "../handlers/UserHandler";
import LevelingHandler from "../handlers/LevelingHandler";
import ContextMenuHandler from "../handlers/ContextMenuHandler";
import API from "../util/API";
import Database from "../util/Database";
import i18n from "../util/i18n";
import Logger from "../util/Logger";
import { client } from "../bot";

export default class ArosClient extends Client {
    
    public handlers = {
        events: new EventHandler(this),
        users: new UserHandler(this),
        commands: new CommandHandler(this),
        api: new API(this),
        guilds: new GuildHandler(this),
        tags: new TagHandler(this),
        levels: new LevelingHandler(this),
        menus: new ContextMenuHandler(this),
    }

    public countsToday = {
        commands: 0,
        tags: 0,
        users: 0,
        guilds: 0
    }
    public currencyConfig = {
        daily: 10000,
        weekly: 100000,
        monthly: 1000000
    }

    private _logger = Logger;
    public translate: Map<string, TFunction> = new Map();
    public db?: Database = undefined; 
    constructor() {
        super({
            partials: ['MESSAGE', 'CHANNEL'],
            intents: [
                Intents.FLAGS.GUILDS, 
                Intents.FLAGS.GUILD_MEMBERS, 
                Intents.FLAGS.GUILD_BANS, 
                Intents.FLAGS.GUILD_PRESENCES, 
                Intents.FLAGS.GUILD_MESSAGES, 
                Intents.FLAGS.DIRECT_MESSAGES, 
                Intents.FLAGS.GUILD_MESSAGE_REACTIONS
            ],
            presence: {
                activities: [{
                        name: `/help | ${process.env.PREFIX}help - support.folds.cc`,
                        type: 'WATCHING'
                    }
                ]}
        } as ClientOptions);
        this.login(process.env.DISCORD_TOKEN!).catch((err) => this.logger.error(`Error while logging in: `, err))
    }
    public async login(token: string): Promise<string> {
        this.ping();
        schedule.scheduleJob(`25 * * * *`, async () => {
            await this.ping()

            //this sets the presence (cos discord sometimes resets it)
            this.user?.setPresence({
                activities: [{
                        name: `/help | ${process.env.PREFIX}help - support.folds.cc`,
                        type: 'WATCHING',
                    }
                
                ]
            })

            const madeRequest = await (await fetch(`https://raw.githubusercontent.com/mitchellkrogza/Phishing.Database/master/phishing-domains-ACTIVE.txt`)).text();
            await writeFile('./etc/phishing-domains.txt', madeRequest).catch(err => client.logger.error(`Error writing phishing-domains.txt.`, err))
        });
        const madeRequest = await (await fetch(`https://raw.githubusercontent.com/mitchellkrogza/Phishing.Database/master/phishing-domains-ACTIVE.txt`)).text();
        await writeFile('./etc/phishing-domains.txt', madeRequest).catch(err => client.logger.error(`Error writing phishing-domains.txt.`, err))
        this.translate = await i18n();
        this.on('error', (err) => {this.logger.error(`Client error: `, err)});
        return super.login(token);
    }


    public async ping() {
        if(!this.user?.presence.activities?.[0]) {
            this.user?.setActivity(`/help | ${process.env.PREFIX}help - bot.folds.cc`, {type: 'WATCHING'})
        }
        await fetch('https://api.folds.cc/bot/ping', {
            method: 'POST',
            headers: {
                'Authorization': `Bot ${this.token}`,
            },
            body: JSON.stringify({servers: this.guilds.cache.size, users: this.users.cache.size, commands_today: this.countsToday.commands}),
        }).catch(err => client.logger.error(`Error sending ping.`, err))
        

        
    }

    
    get logger() {
        return this._logger
    }
}