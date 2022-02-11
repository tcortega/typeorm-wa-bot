import { Message } from "@open-wa/wa-automate";
import { TwitterScraper } from "@tcortega/twitter-scraper";
import { DefineCommand } from "../decorators/DefineCommand";
import BaseCommand from "../libs/BaseCommand";
import Util from "../utils/Util";

@DefineCommand("tt", {
  aliases: ["twitter"],
  argsLength: 1,
})
export default class extends BaseCommand {
  public async exec(msg: Message, args: string[]) {
    const url = args.pop()!;

    if (!Util.isValidTweetUrl(url)) return await this.client.reply(msg.chatId, "O link do tweet é inválido.", msg.id);

    const twtScraper = await TwitterScraper.create();
    const tweetData = await twtScraper.getTweetMeta(url);

    if (!tweetData.isMedia)
      return await this.client.reply(msg.chatId, "O link que você mandou não é de uma imagem ou de um vídeo.", msg.id);

    await this.client.sendFileFromUrl(
      msg.chatId,
      tweetData.media_url![0].url,
      "LeviBot",
      tweetData.description!,
      msg.id
    );
  }
}
