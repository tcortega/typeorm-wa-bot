import AdmZip from "adm-zip";
import axios from "axios";
import Util from "../utils/Util";

axios.defaults.timeout = 20000;

class BacioApi {
  private _telefone: string;
  private _email: string;
  private _code: string;

  public constructor(public name: string, public cpf: string = "") {}

  public async create(): Promise<IBacioWallet> {
    await this.getFakeInfo();
    await this.getSmsCode();

    return await this.genWallet();
  }

  private async getFakeInfo(retry: boolean = false) {
    const { data } = await axios.post("https://www.4devs.com.br/ferramentas_online.php", "acao=gerar_pessoa&sexo=I&pontuacao=S&idade=19&cep_estado=ES&txt_qtde=1&cep_cidade=2044");

    this._telefone = data.celular;
    this.cpf = this.cpf && !retry ? this.cpf : data.cpf;
    this._email = data.email;
  }

  private async getSmsCode() {
    const { data } = await axios.get(`https://passbook.com.br/sms/${this._telefone.replace(/^\D+/g, "")}`);

    this._code = data.code;
  }

  private async genWallet(): Promise<IBacioWallet> {
    const name = this.name.replace(" ", "+");
    const postBody = `code=${this._code}&name=${name}&uniqueId=${this.cpf}&email=${this._email}&birthday=17%2F05%2F2002&phone=${this._telefone}&type_access=Android&hasPreRegister=true&hasAddFields=true&hasCompletePoints=true&radioSexo=Masculino&textCEP=29104610&textEndereco=Rua+Rosa&textNumero=238&textComplemento=&textBairro=Jardim+Colorado&textEstado=ES&textCidade=Vila+Velha`;

    const { data } = await axios.post("https://passbook.com.br/invite/5b1c8b25dfd60c224f208002", postBody);
    const walletUrl = Util.parseLR("location = '", "'", data)![0];

    const res = await axios.get(walletUrl, { responseType: "arraybuffer" });

    const zip = new AdmZip(res.data);
    const entryData = zip.getEntry("pass.json")!.getData();
    const passbook = JSON.parse(entryData.toString());
    const pin = passbook.storeCard.auxiliaryFields[0].value;

    return {
      name: Util.capitalizeName(this.name),
      cpf: this.cpf,
      pin: pin,
      url: walletUrl,
    };
  }
}

export { BacioApi };

export interface IBacioWallet {
  name: string;
  cpf: string;
  pin: string;
  url: string;
}
