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
            .setFooter("© 2021 - Aros 🎉")
            .setTimestamp()
    }

    static generateWarningEmbed(title: string, warning: string): MessageEmbed {
        return new MessageEmbed()
            .setTitle(`⚠️ - ${title}`)
            .setDescription(warning)
            .setColor('#eed202')
            .setFooter("© 2021 - Aros 🎉")
            .setTimestamp()

    }

    static generateInfoEmbed(title: string, description: string): MessageEmbed {
        return new MessageEmbed()
            .setTitle(`${title}`)
            .setDescription(description)
            .setTimestamp()
            .setColor('#cbdbfe')
            .setFooter("© 2021 - Aros 🎉")
    }

    static generateRandomColorEmbed(title: string, description: string): MessageEmbed {
        return new MessageEmbed()
            .setTitle(`💥 - ${title}`)
            .setDescription(description)
            .setTimestamp()
            .setFooter("© 2021 - Aros 🎉")
            .setColor('RANDOM')
    }

    static generateLoadingEmbed(isLoaded: boolean = false, title: string, description: string): MessageEmbed {
        return new MessageEmbed()
            .setTitle(`${isLoaded ? title : `Loading - ${title}`}`)
            .setDescription(description)
            .setFooter("© 2021 - Aros 🎉")
            .setTimestamp()
            .setColor(isLoaded ? '#03254C' : '#187bcd')

    }



}