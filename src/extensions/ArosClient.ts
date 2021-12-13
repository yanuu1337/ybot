import { Client, ClientOptions, Intents } from "discord.js"
import { TFunction } from "i18next";
import CommandHandler from "../handlers/CommandHandler";
import EventHandler from "../handlers/EventHandler";
import UserHandler from "../handlers/UserHandler";
import Database from "../util/Database";
import i18n from "../util/i18n";
import Logger from "../util/Logger";

export default class ArosClient extends Client {
    public events = new EventHandler(this)
    public dbUsers = new UserHandler(this);
    public commands = new CommandHandler(this);
    private _logger = Logger;
    public translate: Map<string, TFunction> = new Map();
    public db?: Database = undefined; 
    constructor() {
        super({
            partials: ['MESSAGE', 'CHANNEL'],
            intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES],
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

    
    get logger() {
        return this._logger
    }
}