import { Message } from "@open-wa/wa-automate";
import { getRepository } from "typeorm";
import { DefineCommand } from "../decorators/DefineCommand";
import BaseCommand from "../libs/BaseCommand";
import { ValorantApi } from "../libs/ValorantApi";
import User from "../models/User";
import Util from "../utils/Util";
import ValorantUtils from "../utils/ValorantUtils";

@DefineCommand("store", {
  aliases: ["loja"],
})
export default class extends BaseCommand {
  public async exec(msg: Message) {
    const repo = getRepository(User);

    const user = await repo.findOne({ where: { whatsapp_id: msg.sender.id } });
    if (!user) return await this.client.reply(msg.chatId, "Você não se cadastrou, se cadastre antes usando *!reg login senha*!", msg.id);

    await this.processing(msg);

    const [login, senha] = user.valorant_data.split(":");
    const api = new ValorantApi(login, senha);
    try {
      await api.login();
      const storeWeapons = await api.getUserStore();
      const storeDataUrl = Util.bufferToDataUrl("image/png", await ValorantUtils.getUserStoreImage(storeWeapons));

      // console.log("⏱️  Trying to send image with @open-wa/wa-automate-nodejs...");
      return await this.client.sendImage(msg.chatId, storeDataUrl, "loja.png", "", msg.id);
    } catch (err) {
      this.client.log.error(err);
      return await this.client.reply(msg.chatId, "Não consegui me autênticar com a loja, algo deu errado :(", msg.id);
    }
  }
}
