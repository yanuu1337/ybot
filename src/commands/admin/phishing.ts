import { Message } from "discord.js";
import { RowDataPacket } from "mysql2";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";

export default class extends Command {
    description = "Add/remove a phishing domain to the database";
    usage = "phishing <add/remove> <domain>";
    aliases = ["phish"];
    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        if(!["add", "remove", "legit", "unlegit"].includes(args[0]?.toLowerCase())) {
            return message.reply(`Please specify a valid action. Valid actions are: \`add\`, \`remove\``);
        }
        if(!args[1]) {
            return message.reply(`Please specify a domain.`);
        }
        const domain = args[1].toLowerCase();
        const allPhishingDomains = (await client.db?.query(`SELECT * FROM phishing_data`))?.[0] as RowDataPacket[];
        if(args[0].toLowerCase() === "add") {
            if(allPhishingDomains.map(val => val.domain).includes(domain)) {
                return message.reply(`That domain is already in the database.`).catch(err => client.logger.error(err));
            }
            await client.db?.insert('phishing_data', {domain});
            return message.reply(`Successfully added that domain to the database.`).catch(err => client.logger.error(err));
        }
        if(args[0].toLowerCase() === "remove") {
            if(!allPhishingDomains.map(val => val.domain).includes(domain)) {
                return message.reply(`That domain is not in the database.`).catch(err => client.logger.error(err));
            }
            await client.db?.insert('phishing_data', {domain});
            return message.reply(`Successfully removed that domain from the database.`);
        } else if (args[0].toLowerCase() === "legit") {
            //@ts-ignore
            if(allPhishingDomains.map(l => l.domain).includes(domain)) await client.db?.update('phishing_data', {domain}, {legit: true});
            await client.db?.insert('phishing_data', {domain, legit: true});
            return message.reply(`Successfully added that domain to the database as legit.`).catch(err => client.logger.error(err));
        } else if (args[0].toLowerCase() === "unlegit") {
            //@ts-ignore
            if(!allPhishingDomains.map(l => l.domain).includes(domain)) await client.db?.update('phishing_data', {domain}, {legit: false});
            await client.db?.insert('phishing_data', {domain, legit: false});
            return message.reply(`Successfully removed that domain from the database as legit.`).catch(err => client.logger.error(err));
        }
    }
}