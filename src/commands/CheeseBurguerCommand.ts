import { Message } from "@open-wa/wa-automate";
import axiosLib from "axios";
import { DefineCommand } from "../decorators/DefineCommand";
import BaseCommand from "../libs/BaseCommand";
import Util from "../utils/Util";

const axios = axiosLib.create({ timeout: 60000 });

@DefineCommand("cb", {
  aliases: ["cheeseburguer", "mc"],
})
export default class extends BaseCommand {
  public async exec(msg: Message) {
    await this.processing(msg, "*Processando... Obs.: Pode demorar de 15-20 segundos!*");

    const res = await axios.get("http://localhost:5000/api/Runner?configId=M%C3%A9qui&data=awdad%3AAwdad&useProxy=false&proxyGroupId=0");

    if (res.data.status != "SUCCESS") {
      this.client.log.error(res.data);
      return await this.client.reply(msg.chatId, "Houve algum erro :( Pede ajuda pro meu dev ou tenta de novo.", msg.id);
    }

    // const coupon = "OKASD";
    const coupon: string = res.data.captures[0].value;
    const expirationDate: string = res.data.captures[1].value;

    const res2 = await axios.get(`https://api.qrcode-monkey.com/qr/custom?data=${coupon}&download=true&file=png&size=600`, { responseType: "arraybuffer" });
    const buffer = Buffer.from(res2.data, "binary");
    const b64 = Util.bufferToDataUrl("image/png", buffer);

    const replyMsg = `✅ *Cupom de CheeseBurguer gratis gerado com sucesso!*
🎟️ Cupom: ${coupon}
🕒 Expira em: ${expirationDate}

ℹ️ _Você pode retirar seu cheeseburguer grátis em qualquer estabelecimento McDonalds que esteja nesta lista:_ https://cupons.mcdonalds.com.br/cheeseburgergratisapp`;

    return await this.client.sendImage(msg.chatId, b64, "coupon.png", replyMsg, msg.id);
  }
}
