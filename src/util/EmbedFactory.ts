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
            .setFooter("© 2022 - Aros 🎉")
            .setTimestamp()
    }

    static generateWarningEmbed(title: string, warning: string): MessageEmbed {
        return new MessageEmbed()
            .setTitle(`⚠️ - ${title}`)
            .setDescription(warning)
            .setColor('#eed202')
            .setFooter("© 2022 - Aros 🎉")
            .setTimestamp()

    }

    static generateInfoEmbed(title: string, description: string): MessageEmbed {
        return new MessageEmbed()
            .setTitle(`${title}`)
            .setDescription(description)
            .setTimestamp()
            .setColor('#cbdbfe')
            .setFooter("© 2022 - Aros 🎉")
    }

    static generateRandomColorEmbed(title: string, description: string): MessageEmbed {
        return new MessageEmbed()
            .setTitle(`💥 - ${title}`)
            .setDescription(description)
            .setTimestamp()
            .setFooter("© 2022 - Aros 🎉")
            .setColor('RANDOM')
    }

    static generateLoadingEmbed(isLoaded: boolean = false, title: string, description: string): MessageEmbed {
        return new MessageEmbed()
            .setTitle(`${isLoaded ? title : `Loading - ${title}`}`)
            .setDescription(description)
            .setFooter("© 2022 - Aros 🎉")
            .setTimestamp()
            .setColor(isLoaded ? '#03254C' : '#187bcd')

    }

    //generateModerationEmbed
    static generateModerationEmbed(author: any, member: any, type: string, reason: string): MessageEmbed {
        return new MessageEmbed()
            .setTitle(`📝 - ${type}`)
            .setDescription(`${author} ${type}d ${member} for ${reason}`)
            .setFooter("© 2022 - Aros 🎉")
            .setTimestamp()
            .setColor('#03254C')
    }
    



}