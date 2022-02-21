export default class CpfUtils {
  public static geraCpfValido(cpf: string) {
    const restoPrimeiroDigito = CpfUtils.pegaRestoDivisaoCpf(cpf);
    cpf += CpfUtils.geraDigitoCpf(restoPrimeiroDigito);

    const restoSegundoDigito = CpfUtils.pegaRestoDivisaoCpf(cpf);
    cpf += CpfUtils.geraDigitoCpf(restoSegundoDigito);

    return cpf;
  }

  public static isCpfValido(cpf: string) {
    if (cpf.length == 9) return true;

    if (cpf.length != 11) return false;

    if (cpf == "") return true;

    if (
      cpf.length != 11 ||
      cpf == "00000000000" ||
      cpf == "11111111111" ||
      cpf == "22222222222" ||
      cpf == "33333333333" ||
      cpf == "44444444444" ||
      cpf == "55555555555" ||
      cpf == "66666666666" ||
      cpf == "77777777777" ||
      cpf == "88888888888" ||
      cpf == "99999999999"
    )
      return false;

    let add = 0;
    for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev == 10 || rev == 11) rev = 0;
    if (rev != parseInt(cpf.charAt(9))) return false;
    // Valida 2o digito
    add = 0;
    for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11) rev = 0;
    if (rev != parseInt(cpf.charAt(10))) return false;
    return true;
  }

  private static pegaRestoDivisaoCpf(cpf: string) {
    let soma = 0;

    let i = 0;
    for (let j = cpf.length + 1; j >= 2; j--) {
      soma += Number(cpf[i]) * j;
      i++;
    }

    return soma % 11;
  }

  private static geraDigitoCpf(resto: number) {
    return [0, 1].includes(resto) ? 0 : 11 - resto;
  }
}
