import { Message } from "@open-wa/wa-automate";
import { DefineCommand } from "../decorators/DefineCommand";
import BaseCommand from "../libs/BaseCommand";

@DefineCommand("todos", {
  aliases: ["everyone", "anuncio", "anunciar"],
  groupOnly: true,
})
export default class extends BaseCommand {
  public async exec(msg: Message, args: string[]) {
    let members: string[] = await this.client.getGroupMembersId(msg.chatId as Message["chat"]["groupMetadata"]["id"]);
    members = members.map((number) => `@${number.replace(/@c.us/g, "")}`);

    await this.client.sendTextWithMentions(msg.chatId, members.join(" ") + args.join(" "), true);
  }
}
