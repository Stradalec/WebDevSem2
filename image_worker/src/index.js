require("dotenv").config();

const express = require("express");
const { connectDatabase } = require("./database");
const { startKafkaWorker } = require("./kafka");

async function bootstrap() {
  await connectDatabase();

  const app = express();

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "image-worker",
    });
  });

  const port = process.env.PORT || 3001;

  app.listen(port, () => {
    console.log(`[http] image worker listening on port ${port}`);
  });

  await startKafkaWorker();
}

bootstrap().catch((error) => {
  console.error("[fatal]", error);
  process.exit(1);
});
