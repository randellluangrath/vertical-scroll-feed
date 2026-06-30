import express from "express";
import cors from "cors";
import contentRoutes from "./routes/content";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => res.json({ status: "ok", ts: Date.now() }));
app.use("/api/content", contentRoutes);

app.listen(PORT, () => {
  console.log(`GoodWatch API → http://localhost:${PORT}`);
  console.log(`  GET /api/content?rail=for-you&genre=kids`);
  console.log(`  GET /api/content/:id`);
  console.log(`  GET /api/content/:id/reviews`);
});
