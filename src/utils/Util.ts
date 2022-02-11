import { readdirSync, statSync } from "fs";
import { join } from "path";

export default class Util {
  public constructor() {}

  public static readdirRecursive(directory: string): string[] {
    const results: string[] = [];

    function read(path: string): void {
      const files = readdirSync(path);

      for (const file of files) {
        const dir = join(path, file);
        if (statSync(dir).isDirectory()) read(dir);
        else results.push(dir);
      }
    }
    read(directory);

    return results;
  }

  public static async wait(ms: number): Promise<NodeJS.Timeout> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public static bufferToDataUrl(mimetype: string, buffer: Buffer): string {
    return `data:${mimetype};base64,${buffer.toString("base64")}`;
  }

  public static parseLR(left: string, right: string, input: string): RegExpExecArray | null {
    left = this.escapeString(left);
    right = this.escapeString(right);

    const rx = "(?<=" + left + ").+?(?=" + right + ")";
    return new RegExp(rx).exec(input);
  }

  public static escapeString(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  public static capitalizeName(name: string) {
    return name.replace(/\b(\w)/g, (s) => s.toUpperCase());
  }

  public static isValidTweetUrl(url: string): boolean {
    return /(?:http)?(?:s:\/\/)?(?:www\.)?twitter\.com\/([a-zA-Z0-9_]+)\/status\/[0-9]{19}/.test(url);
  }
}
