import { Client, ClientOptions, Intents } from "discord.js"
import EventHandler from "../handlers/EventHandler";
import UserHandler from "../handlers/UserHandler";
import Database from "../util/Database";
import Logger from "../util/Logger";

export default class ArosClient extends Client {
    
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
    private _logger = Logger;
    public db?: Database = undefined; 
    public async login(token: string): Promise<string> {
        return super.login(token);
    }

    public events = new EventHandler(this)
    public dbUsers = new UserHandler(this);
    get logger() {
        return this._logger
    }
}