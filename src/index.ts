import "reflect-metadata";
import LeviBot from "./libs/Levi";

// console.log("porra");

const levi: LeviBot = new LeviBot({
  sessionId: "LeviBot",
  headless: true,
  multiDevice: true,
  licenseKey: process.env.WA_LICENSE_KEY,
  // licenseKey: "1E019B9C-123C4C41-9B30FDDC-CEC9A1C7",
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
