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
    
  }
}
