import { Client } from "@open-wa/wa-automate";
import { createConnection } from "typeorm";

export default async function createDatabaseConnection(client: Client): Promise<void> {
  const connection = await createConnection();
  client.log.info("📦 Database connection established successfully!");

  process.on("SIGINT", () => {
    connection.close().then(() => {
      client.log.info("🔒 Database connection closed successfully!");
    });
  });
}
