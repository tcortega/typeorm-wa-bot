import "reflect-metadata";
import LeviBot from "./libs/Levi";

const levi: LeviBot = new LeviBot({
  sessionId: "LeviBot",
  headless: true,
  multiDevice: true,
  licenseKey: process.env.WA_LICENSE_KEY,
  qrTimeout: 0,
  authTimeout: 0,
  cacheEnabled: false,
  useChrome: true,
  killProcessOnBrowserClose: true,
  throwErrorOnTosBlock: false,
  disableSpins: true,
  chromiumArgs: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--aggressive-cache-discard",
    "--disable-cache",
    "--disable-application-cache",
    "--disable-offline-load-stale-cache",
    "--disk-cache-size=0",
  ],
});

(async () => await levi.start())();
