
import { client } from "../bot";

export default class Utility extends null {
    constructor() {
        
    }

    static isString(val: any) {
        return Object.prototype.toString.call(val) === '[object String]';
    }

    static translate(language?: string, key?: string, args?: Record<string, unknown>) {
        
        const lang = client.translate.get(language ?? 'en-US');

        if(!lang) throw new Error(`No language.`)
        if(!key) throw new Error(`No key specified.`)
        return lang(key, args);
    }

    static getChunk(...args: any[]) {
        const [arr, len] = args;
        const rest = [];
        for(let i = 0; i < arr.length; i += len) {
            rest.push(arr.slice(i, i + len))
        }
        return rest;
    }
}