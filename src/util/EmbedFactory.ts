import { MessageEmbed } from "discord.js"


export default class EmbedFactory {
    constructor() {
        throw new Error(`The class ${this.constructor.name} is not supposed to be instantiated!`)
    }
    
    static generateErrorEmbed(title: string, error: string): MessageEmbed {
        return new MessageEmbed()
            .setTitle(`⛔ - ${title}`)
            .setDescription(error)
            .setColor('#992D22')
            .setFooter({text: `© ${new Date().getFullYear()} - yBot 🎉`})
            .setTimestamp()
    }

    static generateWarningEmbed(title: string, warning: string): MessageEmbed {
        return new MessageEmbed()
            .setTitle(`⚠️ - ${title}`)
            .setDescription(warning)
            .setColor('#eed202')
            .setFooter({text: `© ${new Date().getFullYear()} - yBot 🎉`})
            .setTimestamp()

    }

    static generateInfoEmbed(title: string, description: string): MessageEmbed {
        return new MessageEmbed()
            .setTitle(`${title}`)
            .setDescription(description)
            .setTimestamp()
            .setColor('#cbdbfe')
            .setFooter({text: `© ${new Date().getFullYear()} - yBot 🎉`})
    }

    static generateRandomColorEmbed(title: string, description: string): MessageEmbed {
        return new MessageEmbed()
            .setTitle(`💥 - ${title}`)
            .setDescription(description)
            .setTimestamp()
            .setFooter({text: `© ${new Date().getFullYear()} - yBot 🎉`})
            .setColor('RANDOM')
    }

    static generateLoadingEmbed(isLoaded: boolean = false, title: string, description: string): MessageEmbed {
        return new MessageEmbed()
            .setTitle(`${isLoaded ? title : `Loading - ${title}`}`)
            .setDescription(description)
            .setFooter({text: `© ${new Date().getFullYear()} - yBot 🎉`})
            .setTimestamp()
            .setColor(isLoaded ? '#03254C' : '#187bcd')

    }

    static generateModerationEmbed(author: any, member: any, type: string, reason: string): MessageEmbed {
        return new MessageEmbed()
            .setTitle(`📝 - ${type}`)
            .setDescription(`${author} ${type}'d ${member} for \`${reason}\``)
            .setFooter({text: `© ${new Date().getFullYear()} - yBot 🎉`})
            .setTimestamp()
            .setColor('#03254C')
    }




}