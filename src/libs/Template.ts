import fs from "fs";
import path from "path";

class Template {
  private _templatePath: string;
  private _variables: ITemplateVariable[];

  constructor(fileName: string, variables: ITemplateVariable[] = []) {
    this._templatePath = path.join(__dirname, "../public/templates", fileName);
    this._variables = variables;
  }

  public build(): string {
    var template = fs.readFileSync(this._templatePath, "utf-8");

    this._variables.forEach((variable) => {
      const re = new RegExp(`{${variable.name}}`, "g");
      template = template.replace(re, variable.value);
    });

    return template;
  }

  public addVariable(name: string, value: any): Template {
    this._variables.push({ name, value });
    return this;
  }

  public toString(): string {
    return this.build();
  }
}

interface ITemplateVariable {
  name: string;
  value: any;
}

export { Template, ITemplateVariable };
