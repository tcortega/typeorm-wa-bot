import { Client, Message } from "@open-wa/wa-automate";
import { ICommandOptions } from "../decorators/DefineCommand";
import MessageHandler from "../handlers/MessageHandler";
import BaseChatBot from "./OpenAi/BaseChatBot";

export default abstract class BaseCommand implements ICommand {
  public path = __dirname;
  public handler: MessageHandler | undefined;

  public constructor(public client: Client, public id: string, public options: ICommandOptions) {}

  abstract exec(msg: Message, args?: string[], chatBot?: BaseChatBot): any;

  protected async processing(msg: Message, warning: string = "*Processando...*"): Promise<void> {
    await this.client.reply(msg.chatId, warning, msg.id);
  }

  protected parseFlags(query: string[]): string[] {
    const flags: string[] = [];

    for (const str of query) {
      if (str.startsWith("--") && str.slice(2).length > 0) flags.push(str.slice(2));
    }

    return flags;
  }
}

interface ICommand {
  id: string;
  options: ICommandOptions;
  path?: string;
  client?: Client;
  exec(msg: Message, args?: string[], chatBot?: BaseChatBot): Promise<any> | any;
}
