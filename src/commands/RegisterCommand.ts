import { Message } from "@open-wa/wa-automate";
import { getRepository } from "typeorm";
import { DefineCommand } from "../decorators/DefineCommand";
import BaseCommand from "../libs/BaseCommand";
import { ValorantApi } from "../libs/ValorantApi";
import User from "../models/User";

@DefineCommand("register", {
  aliases: ["registrar", "reg", "cadastrar"],
  argsLength: 2,
})
export default class extends BaseCommand {
  public async exec(msg: Message, args: string[]) {
    const isValidUsage = await this.validateUsage(msg, args);
    if (!isValidUsage) return;

    const repo = getRepository(User);

    let user = await repo.findOne({ where: { whatsapp_id: msg.sender.id } });
    if (!user) user = new User();

    user.valorant_data = args.join(":");
    user.whatsapp_id = msg.sender.id;

    await repo.save(user);

    return await this.client.reply(msg.chatId, "Dados salvos com sucesso! agora tente ver sua loja com o comando !loja", msg.id);
  }

  private async validateUsage(msg: Message, args: string[]): Promise<boolean> {
    const api = new ValorantApi(args[0], args[1]);
    try {
      await api.login(false);
    } catch {
      await this.client.reply(msg.chatId, "Não consegui logar não, os dados tão certos mesmo makakinho?", msg.id);
      return false;
    }

    return true;
  }
}
