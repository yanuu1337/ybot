import { Formatters, Message, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { evaluate } from "mathjs";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";

export default class extends Command {
    description = "Launch a calculator using buttons. Parts of code are from weky-npm calculator.";
    aliases = ['calc']
    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        

        let str: string | string[] = ' ' as string;
	    let stringify = Formatters.codeBlock(str);
        const row = [];
        const rows: MessageActionRow[] = [];

        const button = new Array<MessageButton[]>([], [], [], [], []);
        const buttons = new Array<MessageButton[]>([], [], [], [], []);
        const text = ['(', ')','^','mod','AC','7','8','9','÷','OFF','4','5','6','x','⌫','1','2','3','-','\u200b','.','0','=','+','\u200b'];
        let cur = 0;
        let current = 0;
        for (let i = 0; i < text.length; i++) {
            if (button[current].length === 5) current++;
            button[current].push(
                this.createButton(text[i], false),
            );
            if (i === text.length - 1) {
                for (const btn of button) row.push(this.addRow(btn));
            }
        }
        const embed = new MessageEmbed()
		    .setTitle(`yBot - Calculator`)
		    .setDescription(stringify)
		    .setColor(`AQUA`)
		    .setFooter(`yBot Calculator - uses some of the code from WekyDev's calculator.`)
            .setTimestamp();
        message.reply({embeds: [embed], components: row}).then(async msg => {

            const calc = msg.createMessageComponentCollector({ filter: (fn) => !!fn });
            calc.on('collect', async (btn) => {
                if(btn.user.id !== message.author.id) {
                    return btn.reply({content: `You can't use this calculator! It is bound to ${message.author}.`, ephemeral: true});
                };
                await btn.deferUpdate();
                if (btn.customId === 'calAC') {
					str += ' ';
					stringify = Formatters.codeBlock(str as string);
					this.editMessage(msg, stringify, embed);
				} else if (btn.customId === 'calx') {
					str += '*';
					stringify = Formatters.codeBlock(str as string);
					this.editMessage(msg, stringify, embed);
				} else if (btn.customId === 'cal÷') {
					str += '/';
					stringify = Formatters.codeBlock(str as string);
					this.editMessage(msg, stringify, embed);
				} else if (btn.customId === 'cal⌫') {
					if (str === ' ' || str === '' || str === null || str === undefined) {
						return;
					} else {
						str = typeof str === 'string' ? str.split('') as string[] : str;
						str.pop();
						str = str.join('');
						stringify = Formatters.codeBlock(str);
                        this.editMessage(msg, stringify, embed);
					
                    } 
				} else if (btn.customId === 'cal=') {
					if (str === ' ' || str === '' || str === null || str === undefined) {
						return;
					} else {
						try {
							str += ' = ' + evaluate(typeof str === 'string' ? str.replace("mod", "%") : str);
							stringify = Formatters.codeBlock(str as string);
                            this.editMessage(msg, stringify, embed);

							str = ' ';
							stringify = Formatters.codeBlock(str as string);
						} catch (e) {
							str = `The provided equation is invalid!`;
							stringify = Formatters.codeBlock(str as string);
                            this.editMessage(msg, stringify, embed);
							str = ' ';
							stringify = Formatters.codeBlock(str as string);
						}
					}
				} else if (btn.customId === 'calOFF') {
					str = `The calculator is now disabled.`;
					stringify = Formatters.codeBlock(str as string);
                    this.editMessage(msg, stringify, embed);
					calc.stop();
					this.lockMessage(msg, stringify, buttons, cur, text, rows);
				} else {
					str += btn.customId.replace('cal', '');
					stringify = Formatters.codeBlock(str as string);
                    this.editMessage(msg, stringify, embed);

				}
                

                
            });

        })



    }

    editMessage(message: Message<boolean>, content: string, embed: MessageEmbed) {
        message.edit({
            embeds: [embed.setTimestamp().setDescription(content)],
        });
    }

    lockMessage(message: Message<boolean>, content: string, buttons: MessageButton[][], cur: number, text: string[], rows: MessageActionRow[]) {
        for (let i = 0; i < text.length; i++) {
            if (buttons[cur].length === 5) cur++;
            buttons[cur].push(
                this.createButton(text[i], true),
            );
            if (i === text.length - 1) {
                for (const btn of buttons) rows.push(this.addRow(btn));
            }
        }
        const embed = new MessageEmbed()
            .setTitle(`Aros - Calculator`)
            .setDescription(content)
            .setColor(`AQUA`)
            .setFooter(`Aros Calculator - uses some of the code from WekyDev's calculator.`)
            .setTimestamp();
        message.edit({embeds: [embed], components: rows})
        
    }


    

    createButton(label: string, disabled: boolean) {
        const getRandomString = (length: number) => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
            return result;
        }
		let style = 'SECONDARY' as "SECONDARY" | "PRIMARY" | "DANGER" | "SUCCESS";
		if (label === 'AC' || label === 'OFF' || label === '⌫') {
			style = 'DANGER';
		} else if (label === '=') {
			style = 'SUCCESS';
		} else if (
			label === '(' ||
			label === ')' ||
			label === '^' ||
			label === 'mod' ||
			label === '÷' ||
			label === 'x' ||
			label === '-' ||
			label === '+' ||
			label === '.'
		) {
			style = 'PRIMARY';
		}
		if (disabled) {
			const btn = new MessageButton()
				.setLabel(label)
				.setStyle(style)
				.setDisabled();
			if (label === '\u200b') {
				btn.setCustomId(getRandomString(10));
			} else {
				btn.setCustomId('cal' + label);
			}
			return btn;
		} else {
			const btn = new MessageButton().setLabel(label).setStyle(style);
			if (label === '\u200b') {
				btn.setDisabled();
				btn.setCustomId(getRandomString(10));
			} else {
				btn.setCustomId('cal' + label);
			}
			return btn;
		}
	}

    addRow(buttons: MessageButton[]) {
		const row = new MessageActionRow();
		for (const btn of buttons) {
			row.addComponents(btn);
		}
		return row;
	}
}