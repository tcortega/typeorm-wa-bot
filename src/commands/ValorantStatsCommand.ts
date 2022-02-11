import { Message } from "@open-wa/wa-automate";
import { getRepository } from "typeorm";
import { DefineCommand } from "../decorators/DefineCommand";
import BaseCommand from "../libs/BaseCommand";
import { ValorantApi } from "../libs/ValorantApi";
import User from "../models/User";
import Util from "../utils/Util";
import ValorantUtils from "../utils/ValorantUtils";

@DefineCommand("vstats", {
  aliases: ["info", "mmr"],
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
      const playerData = await api.getPlayerData();

      if (Object.keys(playerData).length == 0) {
        return await this.client.reply(msg.chatId, "Você não tem nenhum dado de partidas ranqueadas na sua conta!", msg.id);
      }

      const playerCardDataUrl = Util.bufferToDataUrl("image/png", await ValorantUtils.getUserDataImage(playerData));

      return await this.client.sendImage(msg.chatId, playerCardDataUrl, "playerCard.png", "", msg.id);
    } catch (err) {
      this.client.log.error(err);
      return await this.client.reply(msg.chatId, "Não consegui me autênticar com o vava, algo deu errado :(", msg.id);
    }
  }
}
