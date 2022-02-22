import { Client, Message } from "@open-wa/wa-automate";
import { join } from "path";
import BaseCommand from "../libs/BaseCommand";
import BaseChatBot from "../libs/OpenAi/BaseChatBot";
import Util from "../utils/Util";

class MessageHandler {
  public readonly commands = new Map<string, BaseCommand>();
  public readonly chatBots = new Map<string, BaseChatBot>();

  public constructor(private readonly _client: Client, private readonly _prefix: string = "!") {}

  public async handle(msg: Message) {
    msg.body = msg.type === "chat" ? msg.body : msg.type === "image" && msg.caption ? msg.caption : msg.type === "video" && msg.caption ? msg.caption : msg.body;

    const isCommand = msg.body.startsWith(this._prefix);
    if (!isCommand) return;

    const { command, args, chatBot } = this.getCommandAndArgs(msg);

    if (!command) return;
    if (!(await this.ValidateUsage(msg, command, args))) return;

    if (!msg.chat.canSend) return;

    if(!chatBot) return await this.runCommand(msg, args, command);

    await this.runCommand(msg, args, command, chatBot);
  }

  private async ValidateUsage(msg: Message, command: BaseCommand, args: string[]): Promise<boolean> {
    if (command.options.argsLength && command.options.argsLength != args.length) {
      await this._client.reply(
        msg.chatId,
        `É esperado *${command.options.argsLength} ${command.options.argsLength > 1 ? "argumentos" : "argumento"}* para esse comando, tá fazendo algo de errado makako.`,
        msg.id
      );
      return false;
    }

    if (command.options.minimumArgs && command.options.minimumArgs > args.length) {
      await this._client.reply(
        msg.chatId,
        `É esperado no mínimo *${command.options.minimumArgs} ${
          command.options.minimumArgs > 1 ? "argumentos" : "argumento"
        }* para esse comando, tá fazendo algo de errado makako.`,
        msg.id
      );
      return false;
    }

    if (command.options.groupOnly && !msg.isGroupMsg) {
      await this._client.reply(msg.chatId, "Esse comando só pode ser usado dentro de grupos.", msg.id);
      return false;
    }

    return true;
  }

  private getCommandAndArgs(msg: Message): ICommandArgs {
    const args = msg.body.slice(this._prefix.length).trim().split(/ +/g);

    const commandID = args.shift();
    const command = this.commands.get(commandID!.toLowerCase()) ?? Array.from(this.commands.values()).find((x) => x.options.aliases?.includes(commandID!));
 
    if (!command?.options.chatBot) return { command, args };

    const chatBot = this.chatBots.get(command.options.chatBot);

    return { command, args, chatBot };
  }

  private async runCommand(msg: Message, args: string[], command: BaseCommand, chatBot?: BaseChatBot) {
    try {
      await this._client.simulateTyping(msg.chatId, true);
      await command.exec(msg, args, chatBot);
    } catch (err) {
      this._client.log.error(err);
    } finally {
      await this._client.simulateTyping(msg.chatId, false);
    }
  }

  public loadCommands(): void {
    this._client.log.info("⌛ Loading commands...");
    let commandCount = 0;

    const path = join(__dirname, "../commands");
    const files = Util.readdirRecursive(path);

    for (const filePath of files) {
      const load = require(filePath).default;
      if (!load || !(load.prototype instanceof BaseCommand)) continue;
      const command = this.getCommand(filePath);

      this.registerCommand(command);
      commandCount++;
    }

    this._client.log.info(`✔️  Loaded ${commandCount} commands.`);
  }

  public loadChatBots(): void {
    this._client.log.info("⌛ Loading ChatBots...");
    let chatBotCount = 0;

    const path = join(__dirname, "../libs/OpenAi");
    const files = Util.readdirRecursive(path).filter(x => !x.includes("BaseChatBot"));
    
    for(const filePath of files) {
      const load = require(filePath).default;
      if (!load || !(load.prototype instanceof BaseChatBot)) continue;
      const chatBot = this.getChatBot(filePath);

      this.registerChatBot(chatBot);
      chatBotCount++;
    }

    this._client.log.info(`✔️  Loaded ${chatBotCount} chatbots.`);
  }

  private getChatBot(path: string): BaseChatBot {
    return new (require(path).default)();
  }

  private getCommand(path: string): BaseCommand {
    const command: BaseCommand = new (require(path).default)(this._client);
    command.client = this._client;
    command.path = path;
    command.handler = this;

    return command;
  }

  private registerChatBot(chatBot: string | BaseChatBot): void {
    if (typeof chatBot == "string") chatBot = this.getChatBot(chatBot);

    console.log(chatBot.name);
    this.chatBots.set(chatBot.name, chatBot);
  }

  private registerCommand(command: string | BaseCommand): void {
    if (typeof command === "string") command = this.getCommand(command);

    this.commands.set(command.id, command);
  }
}

export default MessageHandler;

interface ICommandArgs {
  args: string[];
  command: BaseCommand | undefined;
  chatBot?: BaseChatBot | undefined;
}
