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
       this.rest.put(Routes.applicationCommands(this.client.application?.id!), {body: body ?? this.client.handlers.commands.filter(cmd => cmd.isSlashCommand == true).map(cmd => cmd.data?.toJSON())})
       return null;
   }

   async putGuildTestSlashCommands(body?: JSON | Object | Array<Object>) {
       
    this.rest.put(Routes.applicationGuildCommands(this.client.application?.id!, '856924300215713833'), {body: body ?? this.client.handlers.commands.filter(cmd => cmd.isSlashCommand == true).map(cmd => cmd.commandData?.toJSON())})
    return null;
}
   
}