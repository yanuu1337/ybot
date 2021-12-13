
import { client } from "../bot";

export default class Util extends null {
    constructor() {
        
    }

    static isString(val: any) {
        return Object.prototype.toString.call(val) === '[object String]';
    }

    static translate(language: string, key: string, args?: Record<string, unknown>) {
        
        const lang = client.translate.get(language);

        if(!lang) throw new Error(`No language.`)
        return lang(key, args);
    }
}