import fs from 'fs/promises'
import i18next, { TFunction } from 'i18next';
import { join, resolve } from 'path';
import Backend from 'i18next-node-fs-backend'
async function scanDirs(dir: string, namespaces: string[] = [], folderName = '') {
    
    const files = await fs.readdir(dir);
    const languages: string[] = [];

    for (const file of files) {
        const stat = await fs.lstat(join(dir, file))
        if(stat.isDirectory()) {
            const isLanguage = file.includes('-')
            if(isLanguage) languages.push(file)
            const folder = await scanDirs(join(dir, file), namespaces, isLanguage ? '' : `${file}/`)
            
            namespaces = folder.namespaces;
        } else {
            namespaces.push(`${folderName}${file.substr(0, file.length - 5)}`)
        }
    }
    return {namespaces: [...new Set(namespaces)], languages};

}

export default async (): Promise<Map<string, TFunction>> => {
    const opt = {
        jsonIndent: 2,
        loadPath: resolve(__dirname, '../../etc/languages/{{lng}}/{{ns}}.json')
    };

    const {namespaces, languages} = await scanDirs(join(__dirname, '../../etc/languages/'));
    i18next.use(Backend)

    await i18next.init({
        backend: opt,
        debug: false,
        fallbackLng: 'en-US',
        initImmediate: false,
        interpolation: {escapeValue: false},
        load: 'all',
        ns: namespaces,
        preload: languages
    });
    return new Map(languages.map((item) => [item, i18next.getFixedT(item)]))
}