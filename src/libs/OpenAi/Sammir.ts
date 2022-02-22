import BaseChatBot from "./BaseChatBot";
import fs from "fs";

export default class Sammir extends BaseChatBot {
    constructor() {
        const name = "Sammir";

        const promptFile = `../../public/prompts/${name}.prompt`;

        if (!fs.existsSync(promptFile)) throw new Error(`O arquivo ${name}.prompt não existe!`);

        const prompt = fs.readFileSync(promptFile, {encoding: "utf-8"});

        super(name, prompt);
    }
}