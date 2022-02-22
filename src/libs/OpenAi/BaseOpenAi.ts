import { Configuration, OpenAIApi } from "openai";

export default abstract class BaseOpenAi {
  public static openAi = new OpenAIApi(
    new Configuration({ apiKey: process.env.OpenAi_ApiKey })
  );

  constructor(private name: string, private prompt: string) {}

  private prefix = `\n${this.name}`;
  private suffix = `\n\nVoce`;

  async askQuestion(question: string) {
    const prompt = `${this.prompt}${this.suffix}: ${question}${this.prefix}: `;

    const { data } = await BaseOpenAi.openAi.createCompletion(
      "text-davinci-001",
      {
        prompt,
        temperature: 0.7,
        max_tokens: 96,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: ["\n"],
      }
    );

    if (!data.choices) return "";

    const answer = data.choices[0].text;

    if (!answer) return "";

    this.prompt = prompt + answer;

    return answer;
  }
}
