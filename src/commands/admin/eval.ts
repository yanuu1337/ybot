import { Formatters, Message } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";

export default class extends Command {
    devOnly = true;

    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        //make a eval command
        const code = args.join(" ");
        if(code.includes('client.token')) return message.reply({content: "You can't use client.token in your code!"});
        try {
            let evaled = await eval(code)?.catch?.((err: any) => err);
            const newEvaled = require("util").inspect(evaled);
            return message.reply({embeds: [
                {
                    title: "Success - Eval",
                    description: `Successfully evaluated code: ${(Formatters.codeBlock("js", newEvaled.length > 500 ? newEvaled.substring(0, 500).trimEnd() + `\n<...>` : newEvaled) ?? 'none')}`,
                    fields: [
                        {
                            name: "Code",
                            value: Formatters.codeBlock("js", code) ?? 'none',
                        },
                        
                        {
                            name: "Type",
                            value: `${typeof evaled === 'object' ? `${Object.keys(evaled).length} keys` : typeof evaled}`,
                        },
                        {
                            name: "Length",
                            value: `${newEvaled.length ?? 'Not found' } characters`,
                        }
                    ]
                }
            ]});

        } catch (error) {
            return message.reply({embeds: [
                {
                    title: "Error - Eval",
                    description: `Error evaluating code: \`${error.message}\``,
                    fields: [
                        {
                            name: "Code",
                            value: Formatters.codeBlock("js", code) ?? 'none',
                        },
                    ]
                }
            ]});
        }

    }
}