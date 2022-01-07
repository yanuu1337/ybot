import { Message } from 'discord.js';
import { MessageEmbed, MessageReaction, User } from 'discord.js';
import { CommandInteraction } from 'discord.js';
const EMOJIS = [ '⬅️', '🚫', '➡️'];
export interface PaginationPayload {
    pages: Array<MessageEmbed> | Array<object>;
    embed: MessageEmbed | object;
    edit(index: number, embed: MessageEmbed | object, page: MessageEmbed | object): void
}
export class InteractionPagination {
    interaction: CommandInteraction;
    payload: PaginationPayload;
    constructor(interaction: CommandInteraction, payload: PaginationPayload) {
      this.interaction = interaction;
      this.payload = payload;
    }
  
    async start() {
      const { embed } = this.payload;
      const { pages } = this.payload;
      let index = 0;
      if(!this.interaction.channel) return;
      this.payload.edit.call(this, index, embed, pages[index]);
      const msg = await this.interaction.reply({ embeds: [embed], fetchReply: true }) as Message;
      if (pages.length < 2) return undefined;
      for (const emoji of EMOJIS) await msg.react(emoji);
      const filter = (m: MessageReaction, user: User) => EMOJIS.includes(m.emoji.name!) && user.id === this.interaction.user.id;
      while (true) {
        const responses = await msg.awaitReactions({ filter, max: 1, time: 50000 });
        
        if (!responses?.size) break;
        const emoji = responses.first()?.emoji?.name;
        
        if (emoji === EMOJIS[0]) index--;
        else if (emoji === EMOJIS[2]) index++;
        else {
          msg.reactions.removeAll();
          break;
        }
        index = ((index % pages.length) + pages.length) % pages.length;
        await responses.first()?.users.remove(this.interaction.user.id)
        this.payload.edit.call(this, index, embed, pages[index]);
        await msg.edit({ embeds: [pages[index]] });
      }
    }
  };
  

  export class MessagePagination {
    msg: Message;
    payload: PaginationPayload;
    constructor(interaction: Message, payload: PaginationPayload) {
      this.msg = interaction;
      this.payload = payload;
    }
  
    async start() {
      const { embed } = this.payload;
      const { pages } = this.payload;
      let index = 0;
      if(!this.msg.channel) return;
      this.payload.edit.call(this, index, embed, pages[index]);
      const msg = await this.msg.reply({ embeds: [embed]}) as Message;
      if (pages.length < 2) return undefined;
      for (const emoji of EMOJIS) msg.react(emoji);
      const filter = (m: MessageReaction, user: User) => EMOJIS.includes(m.emoji.name!) && user.id === this.msg.author.id;
      while (true) {
        const responses = await msg.awaitReactions({ filter, max: 1, time: 50000 });
        
        if (!responses?.size) break;
        const emoji = responses.first()?.emoji?.name;
        
        
        if (emoji === EMOJIS[0]) index--;
        else if (emoji === EMOJIS[2]) index++;
        else {
          msg.reactions.removeAll();
          break;
        }
        index = ((index % pages.length) + pages.length) % pages.length;
        await responses.first()?.users.remove(this.msg.author.id)
        this.payload.edit.call(this, index, embed, pages[index]);
        await msg.edit({ embeds: [pages[index]] });
      }
    }
  };
  