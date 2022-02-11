import { Client } from "@open-wa/wa-automate";
import BaseCommand from "../libs/BaseCommand";

export function DefineCommand(identifier: string, options: ICommandOptions) {
  return function <T extends BaseCommand>(target: new (...args: any[]) => T): new (client: Client) => T {
    return new Proxy(target, {
      construct: (ctx, [client]): T => new ctx(client, identifier, options),
    });
  };
}

export interface ICommandOptions {
  aliases?: string[];
  argsLength?: Number;
  minimumArgs?: Number;
  groupOnly?: boolean;
}
