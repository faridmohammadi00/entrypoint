import fs from 'fs';
import path from 'path';

const loadMessages = (lang: string): Record<string, string> => {
    const baseLanguage = lang.split(',')[0].split('-')[0];
    
    try {
        const filePath = path.resolve(process.cwd(), 'src', 'locales', `messages.${baseLanguage}.json`);
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error loading messages for language ${baseLanguage}:`, error);
        if (baseLanguage !== 'en') {
            return loadMessages('en');
        }
        return {};
    }
};

export default loadMessages;
