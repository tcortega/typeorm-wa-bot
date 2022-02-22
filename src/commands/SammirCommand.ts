import { Message } from "@open-wa/wa-automate";
import { DefineCommand } from "../decorators/DefineCommand";
import BaseCommand from "../libs/BaseCommand";
import Sammir from "../libs/OpenAi/Sammir";

@DefineCommand("sammir", {
  aliases: ["s", "sam", "baiano"],
  groupOnly: true,
  chatBot: "Sammir"
})
export default class extends BaseCommand {
  public async exec(msg: Message, args: string[], chatBot: Sammir) {
    const question = args.join(" ");
    
    const answer = await chatBot.askQuestion(question);

    if (!answer) return await this.client.reply(msg.chatId, "oxi nao sei nada disso nao vai se fudde", msg.id);

    await this.client.reply(msg.chatId, answer, msg.id);
  }
}
