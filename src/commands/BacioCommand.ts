import { Message } from "@open-wa/wa-automate";
import { DefineCommand } from "../decorators/DefineCommand";
import { BacioApi } from "../libs/BacioApi";
import BaseCommand from "../libs/BaseCommand";

@DefineCommand("bacio", {
  aliases: ["sv", "sorvete"],
  minimumArgs: 1,
})
export default class extends BaseCommand {
  public async exec(msg: Message, args: string[]) {
    const cpf = /\d/.test(args[args.length - 1]) ? args.pop() : "";

    if (args.length == 0) {
      return await this.client.reply(msg.chatId, "Você tem que enviar seu nome também né porra.", msg.id);
    }

    const name = args.join(" ");

    const bacioApi = new BacioApi(name, cpf);
    this.processing(msg, "*Processando...* _Obs.: Pode demorar até mais de 30 segundos porque a bacio é muito lerda._");

    for (let i = 0; i < 3; i++) {
      try {
        const wallet = await bacioApi.create();

        const replyMsg = `🍨 *Gelato gratis gerado com sucesso!*
👤 Nome: ${wallet.name}
🗃️ CPF: ${wallet.cpf} 
🔑 PIN: ${wallet.pin}

ℹ️ *Dica: Memorize o CPF pois a filha da puta pode te recusar o gelato se achar que o cpf não é seu.*
📎 Link da carteira: ${wallet.url}`;

        return await this.client.reply(msg.chatId, replyMsg, msg.id);
      } catch {}
    }

    return await this.client.reply(msg.chatId, "Não consegui gerar porque a API da bacio é uma merda :(. Tenta o comando de novo!", msg.id);
  }
}
