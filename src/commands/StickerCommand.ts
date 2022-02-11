import { decryptMedia, Message } from "@open-wa/wa-automate";
import { DefineCommand } from "../decorators/DefineCommand";
import BaseCommand from "../libs/BaseCommand";
import Util from "../utils/Util";

@DefineCommand("sticker", {
  aliases: ["stiker", "fig", "figurinha"],
})
export default class extends BaseCommand {
  public async exec(msg: Message, args: string[]) {
    const isValidUsage = await this.validateUsage(msg, args);
    if (!isValidUsage) return;

    this.processing(msg);

    const flags = this.parseFlags(args);
    const isCropped = flags.includes("cortar");
    const isNoBg = flags.includes("bg");
    const isQuoted = !msg.isMedia && !["image", "video"].includes(msg.type) && msg.quotedMsg;
    const mediaType = isQuoted ? msg.quotedMsg!.type : msg.type;
    const mimetype = isQuoted ? msg.quotedMsg!.mimetype! : msg.mimetype!;

    const media = await decryptMedia(isQuoted ? msg.quotedMsg! : msg);
    const mediaBase64 = Util.bufferToDataUrl(mimetype, media);

    if (mediaType == "image") {
      return await this.client.sendImageAsStickerAsReply(msg.chatId, mediaBase64, msg.id, { keepScale: !isCropped, removebg: isNoBg, author: "Levi", pack: "Criado por" });
    }

    return await this.client.sendMp4AsSticker(msg.chatId, mediaBase64, { crop: isCropped }, undefined, msg.id);
  }

  private async validateUsage(msg: Message, args: string[]): Promise<boolean> {
    if (!msg.isMedia && !msg.quotedMsg?.isMedia) {
      await this.client.reply(msg.chatId, "Você precisa enviar ou marcar uma imagem/gif/video com a legenda *!fig* para o comando funcionar.", msg.id);
      return false;
    }

    if (!["image", "video"].includes(msg.type) && msg.quotedMsg?.type != "image" && msg.quotedMsg?.type != "video") {
      await this.client.reply(msg.chatId, "Não foi encontrada nenhum vídeo/gif/imagem para fazer uma figurinha.", msg.id);
      return false;
    }

    if (msg.type == "video" || msg.quotedMsg?.type == "video") {
      if ((Number(msg.duration) >= 15 || Number(msg.quotedMsg?.duration)) >= 15) {
        await this.client.reply(msg.chatId, "A mídia não pode exceder 15 segundos.", msg.id);
        return false;
      }
    }

    return true;
  }
}
