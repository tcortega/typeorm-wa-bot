// import nodeHtmlToImage from "@tcortega/node-html-to-image";
import nodeHtmlToImage from "@tcortega/node-html-to-image";
import { Template } from "../libs/Template";
import { IPlayerData, IWeapon } from "../libs/ValorantApi";

class ValorantUtils {
  public static async getUserStoreImage(userStore: IWeapon[]): Promise<Buffer> {
    let skinsTemplate: string[] = [];

    userStore.forEach((weapon) => {
      let skinTemplate = new Template("Skin.html")
        .addVariable("PriceTier", weapon.priceTier)
        .addVariable("SkinPrice", weapon.price)
        .addVariable("Knife", weapon.isKnife ? "knife" : "")
        .addVariable("SkinName", weapon.name)
        .addVariable("SkinId", weapon.id);

      skinsTemplate.push(skinTemplate.build());
    });

    let storeTemplate = new Template("Store.html").addVariable("Skins", skinsTemplate.join(""));

    // console.log("⏱️  Attempting to get the screenshot as a image using nodeHtmlToImage...");
    const image = await nodeHtmlToImage({
      html: storeTemplate.toString(),
      transparent: true,
      puppeteerArgs: { args: ["--no-sandbox"] },
    });
    // console.log("✔️  Got the buffer from nodeHtmlToImage");

    return image as Buffer;
  }

  public static async getUserDataImage(userData: IPlayerData): Promise<Buffer> {
    const latestPointsChangePositive =
      userData.latestPointsChange < 0 ? userData.latestPointsChange * -1 : userData.latestPointsChange;
    const percentagePointChanges = (latestPointsChangePositive / userData.points) * 100;

    const playerCardTemplate = new Template("PlayerCard.html")
      .addVariable("Nick", userData.name)
      .addVariable("Tag", userData.tag)
      .addVariable("Tier", userData.tier)
      .addVariable("TierNumber", userData.tierNumber)
      .addVariable("PlayerCard", userData.profileCard)
      .addVariable("Points", userData.points)
      .addVariable(
        "PointsChange",
        userData.latestPointsChange > 0 ? `+${userData.latestPointsChange}` : userData.latestPointsChange
      )
      .addVariable(
        "PointsChangeColor",
        userData.latestPointsChange == 0
          ? "white"
          : userData.latestPointsChange > 0
          ? "rgb(144, 238, 144)"
          : "rgb(255,83,73)"
      )
      .addVariable("ChangePercentage", percentagePointChanges.toFixed(2))
      .addVariable(
        "ExtraStyles",
        userData.latestPointsChange < 0
          ? "transform: translate(100%, 0); border-top-left-radius: 0px; border-bottom-left-radius: 0px;"
          : ""
      )
      .addVariable(
        "ExtraStylesPB",
        userData.latestPointsChange < 0 ? "border-top-right-radius: 0px; border-bottom-right-radius: 0px;" : ""
      );

    const image = await nodeHtmlToImage({
      html: playerCardTemplate.toString(),
      puppeteerArgs: { args: ["--no-sandbox"] },
      transparent: true,
    });

    return image as Buffer;
  }

  public static getRankInPortugueseById(id: Number): string {
    switch (id) {
      case 0:
        return "Unranked";
      case 3:
        return "Ferro 1";
      case 4:
        return "Ferro 2";
      case 5:
        return "Ferro 3";
      case 6:
        return "Bronze 1";
      case 7:
        return "Bronze 2";
      case 8:
        return "Bronze 3";
      case 9:
        return "Prata 1";
      case 10:
        return "Prata 2";
      case 11:
        return "Prata 3";
      case 12:
        return "Ouro 1";
      case 13:
        return "Ouro 2";
      case 14:
        return "Ouro 3";
      case 15:
        return "Platina 1";
      case 16:
        return "Platina 2";
      case 17:
        return "Platina 3";
      case 18:
        return "Diamante 1";
      case 19:
        return "Diamante 2";
      case 20:
        return "Diamante 3";
      case 21:
        return "Immortal 1";
      case 22:
        return "Immortal 2";
      case 23:
        return "Immortal 3";
      case 24:
        return "Radiante";
      default:
        return "Unranked";
    }
  }
}

export default ValorantUtils;
