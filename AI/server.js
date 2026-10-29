import "dotenv/config";
import express from "express";
import cors from "cors";
import descriptionRouter from "./routes/description.js";

const app = express();
const port = Number(process.env.PORT) || 5001;

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json({ limit: "10kb" }));

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "campus-kart-ai",
  });
});

app.use("/api/ai", descriptionRouter);

app.listen(port, () => {
  console.log(`AI service running at http://localhost:${port}`);
});
