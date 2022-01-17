import { Client, ClientOptions, Intents } from "discord.js"
import { TFunction } from "i18next";
import CommandHandler from "../handlers/CommandHandler";
import EventHandler from "../handlers/EventHandler";
import GuildHandler from "../handlers/GuildHandler";
import TagHandler from "../handlers/TagHandler";
import UserHandler from "../handlers/UserHandler";
import API from "../util/API";
import Database from "../util/Database";
import i18n from "../util/i18n";
import Logger from "../util/Logger";

export default class ArosClient extends Client {
    
    public handlers = {
        events: new EventHandler(this),
        users: new UserHandler(this),
        commands: new CommandHandler(this),
        api: new API(this),
        guilds: new GuildHandler(this),
        tags: new TagHandler(this),
    }

    public countsToday = {
        commands: 0,
        tags: 0,
        users: 0,
        guilds: 0
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
                        name: `/help | ${process.env.PREFIX}help - aros.folds.cc`,
                        type: 'WATCHING'
                    }
                ]}
        } as ClientOptions);
        this.login(process.env.DISCORD_TOKEN!).catch((err) => console.log(err))
    }
    public async login(token: string): Promise<string> {
        
        this.translate = await i18n();
        return super.login(token);
    }


    public async ping() {
        if(!this.user?.presence.activities?.[0]) {
            this.user?.setActivity(`/help | ${process.env.PREFIX}help - aros.folds.cc`, {type: 'WATCHING'})
        }
        fetch('https://api.folds.cc/bot/ping', {
            method: 'POST',
            headers: {
                'Authorization': `Bot ${this.token}`,
            },
            body: JSON.stringify({servers: this.guilds.cache.size, users: this.users.cache.size, commands_today: this.countsToday.commands}),
        })

        
    }

    
    get logger() {
        return this._logger
    }
}