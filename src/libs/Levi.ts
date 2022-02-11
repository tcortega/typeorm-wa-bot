import { ConfigObject, create } from "@open-wa/wa-automate";
import { Logger } from "winston";
import createDatabaseConnection from "../database/connect";
import MessageHandler from "../handlers/MessageHandler";
import { createLogger } from "../utils/Logger";
import Util from "../utils/Util";
import FormData from "form-data";
import fs from "fs";

class Levi {
  private _messageHandler: MessageHandler;

  public constructor(private readonly _options: ConfigObject) {}

  public async start() {
    const client = await create(this._options);
    this._messageHandler = new MessageHandler(client);

    Object.assign(client, {
      handler: this._messageHandler,
      log: createLogger(),
      util: new Util(),
    });

    await createDatabaseConnection(client);

    this._messageHandler.loadCommands();

    const formData = new FormData();
    const dataUrl = (await client.getSnapshot()).replace(/^data:image\/\w+;base64,/, "");

    const buf = Buffer.from(dataUrl, "base64");

    // console.log(__dirname + "/image.png");
    // fs.writeFileSync(__dirname + "/image.png", buf);
    await client.onMessage(async (message) => {
      await client.sendSeen(message.chatId);
      await this._messageHandler.handle(message);

      const msgAmount = await client.getAmountOfLoadedMessages();
      if (msgAmount > 2500) {
        await client.cutMsgCache();

        const memoryUsed = process.memoryUsage().heapUsed / 1024 / 1024;
        if (memoryUsed > 850) process.exit();
      }
    });

    await client.onStateChanged(async (state) => {
      if (state === "CONFLICT" || state === "UNLAUNCHED") {
        return await client.forceRefocus();
      }

      if (state === "CONNECTED") client.log.debug("Connected to Whatsapp!");
      if (state === "UNPAIRED") client.log.debug("Logged out!");
    });
  }
}

export default Levi;

declare module "@open-wa/wa-automate" {
  interface Client {
    log: Logger;
    util: Util;
  }

  interface Message {
    prefix: string;
  }
}
