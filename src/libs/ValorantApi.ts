import axios, { AxiosResponse } from "axios";
import { CookieJar } from "tough-cookie";
import * as axiosCookieJar from "axios-cookiejar-support";
import ValorantUtils from "../utils/ValorantUtils";

axiosCookieJar.wrapper(axios);

class ValorantApi {
  private _username: string;
  private _password: string;
  private _accessToken: string;
  private _entitlementsToken: string;
  private _userId: string;
  private _userStore: IWeapon[];
  private _clientVersion: string;
  private _clientPlatform: {
    platformType: string;
    platformOS: string;
    platformOSVersion: string;
    platformChipset: string;
  };
  private _completedLogin: boolean;
  private _cookieJar: CookieJar;

  public constructor(username: string, password: string) {
    this._username = username;
    this._password = password;
    this._accessToken = "";
    this._entitlementsToken = "";
    this._userId = "";
    this._userStore = [];
    this._cookieJar = new CookieJar();
    this._clientVersion = "release-03.10-shipping-10-637823";
    this._clientPlatform = {
      platformType: "PC",
      platformOS: "Windows",
      platformOSVersion: "10.0.19042.1.256.64bit",
      platformChipset: "Unknown",
    };
  }

  public async login(completeAuth: boolean = true): Promise<void> {
    await this.getCookies();
    await this.getAccessToken();

    if (completeAuth) {
      await this.finishAuth();
    }

    this._completedLogin = completeAuth;
  }

  public async getUserStore(): Promise<IWeapon[]> {
    if (!this._completedLogin) await this.finishAuth();

    await this.buildUserStore();

    return this._userStore;
  }

  public async getPlayerData(): Promise<IPlayerData> {
    if (!this._completedLogin) await this.finishAuth();

    const { data } = await axios.get(`https://api.henrikdev.xyz/valorant/v1/by-puuid/mmr/na/${this._userId}`);

    if (!data) {
      return {} as IPlayerData;
    }

    const tier = ValorantUtils.getRankInPortugueseById(data.data.currenttier);
    const points = data.data.ranking_in_tier;
    const latestPointsChange = data.data.mmr_change_to_last_game;
    const name = data.data.name;
    const tag = data.data.tag;

    const responseUserData = await axios.get(
      `https://api.henrikdev.xyz/valorant/v1/account/${encodeURI(name)}/${encodeURI(tag)}`
    );

    const profileCard = responseUserData.data.data.card.small;

    return { tier, tierNumber: data.data.currenttier, profileCard, points, latestPointsChange, name, tag };
  }

  private async finishAuth(): Promise<void> {
    await this.getEntitlementsToken();
    await this.getUserId();

    this._completedLogin = true;
  }

  private async getCookies(): Promise<void> {
    const data = {
      client_id: "play-valorant-web-prod",
      nonce: "1",
      redirect_uri: "https://playvalorant.com/opt_in",
      response_type: "token id_token",
    };

    const response = await axios.post("https://auth.riotgames.com/api/v1/authorization", data, {
      jar: this._cookieJar,
      withCredentials: true,
    });

    if (!response.headers["set-cookie"]) throw new Error("No cookies found when attempting to get cookies.");
  }

  private async getAccessToken(): Promise<void> {
    const data = {
      type: "auth",
      username: this._username,
      password: this._password,
    };
    const res = await axios.put("https://auth.riotgames.com/api/v1/authorization", data, {
      jar: this._cookieJar,
      withCredentials: true,
    });
    ValorantApi.validateRequest(res, "getAccessToken");
    const qs = res.data.response.parameters.uri.split("https://playvalorant.com/opt_in#")[1];
    const params = new URLSearchParams(qs);

    var acToken = params.get("access_token");
    if (!acToken) throw new Error("No access token found when attempting to get access tokens.");

    this._accessToken = acToken;
  }

  private async getEntitlementsToken(): Promise<void> {
    const response = await axios.post(
      "https://entitlements.auth.riotgames.com/api/token/v1",
      {},
      { jar: this._cookieJar, withCredentials: true, headers: { Authorization: `Bearer ${this._accessToken}` } }
    );

    this._entitlementsToken = response.data.entitlements_token;
  }

  private async getUserId(): Promise<void> {
    const response = await axios.get("https://auth.riotgames.com/userinfo", {
      jar: this._cookieJar,
      withCredentials: true,
      headers: { Authorization: `Bearer ${this._accessToken}` },
    });

    this._userId = response.data.sub;
  }

  private async buildUserStore(): Promise<void> {
    let res = await axios.get(`https://pd.na.a.pvp.net/store/v2/storefront/${this._userId}`, {
      headers: this.generateRequestHeaders(),
    });

    const userStoreItemsId = res.data.SkinsPanelLayout.SingleItemOffers as string[];

    res = await axios.get("https://api.henrikdev.xyz/valorant/v1/content?locale=pt-BR");
    const skins = res.data.skinLevels as ISkin[];

    res = await axios.get("https://api.henrikdev.xyz/valorant/v1/store-offers");
    const offers = res.data.data.Offers as IOffer[];

    this._userStore = userStoreItemsId.map((uuid) => {
      uuid = uuid.toUpperCase();
      var skin = skins.find((s) => s.id == uuid);
      uuid = uuid.toLowerCase();
      var offer = offers.find((o) => o.OfferID == uuid);
      var skinPrice = Object.values(offer?.Cost)[0] as Number;

      return {
        id: uuid,
        name: skin?.name,
        price: skinPrice,
        priceTier: ValorantApi.getPriceTier(skinPrice),
        isKnife: skin?.name.includes("Faca"),
      } as IWeapon;
    });
  }

  private static getPriceTier(price: Number): string {
    switch (price) {
      case 875:
        return "12683d76-48d7-84a3-4e09-6985794f0445";
      case 1275:
        return "0cebb8be-46d7-c12a-d306-e9907bfc5a25";
      case 1775:
        return "60bca009-4182-7998-dee7-b8a2558dc369";
      case 2175:
        return "60bca009-4182-7998-dee7-b8a2558dc369";
      case 2475:
        return "411e4a55-4e59-7757-41f0-86a53f101bb5";
      default:
        return "e046854e-406c-37f4-6607-19a9ba8426fc";
    }
  }

  private static validateRequest(response: AxiosResponse<any>, origin: string): void {
    const dataString = String(response.data);
    if (dataString.includes("error")) throw new Error(`Error making ${origin} requests:\n` + dataString);
  }

  private generateRequestHeaders(extraHeaders = {}) {
    const defaultHeaders = {
      Authorization: `Bearer ${this._accessToken}`,
      "X-Riot-Entitlements-JWT": this._entitlementsToken,
      "X-Riot-ClientVersion": this._clientVersion,
      "X-Riot-ClientPlatform": Buffer.from(JSON.stringify(this._clientPlatform)).toString("base64"),
    };

    return {
      ...defaultHeaders,
      ...extraHeaders,
    };
  }
}

export { ValorantApi };

export interface IWeapon {
  id: string;
  name: string;
  price: Number;
  priceTier: string;
  isKnife: boolean;
}

export interface IPlayerData {
  tier: string;
  tierNumber: number;
  profileCard: string;
  points: number;
  latestPointsChange: number;
  name: string;
  tag: string;
}

interface IOffer {
  OfferID: string;
  Cost: any;
}

interface ISkin {
  name: string;
  id: string;
}

interface ITierData {
  tier: number;
  largeIcon: string;
}
