import { Router, Request, Response } from "express";
import { CONTENT } from "../data";
import { Rail } from "../types";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  const { rail, genre } = req.query as { rail?: string; genre?: string };

  let results = [...CONTENT];

  if (rail) {
    results = results.filter((c) => c.rails.includes(rail as Rail));
  }

  if (genre) {
    results = results.filter((c) => c.genres.includes(genre));
  }

  if (rail === "trending") {
    results.sort((a, b) => (a.trendingRank ?? 99) - (b.trendingRank ?? 99));
  }

  res.json({ data: results });
});

router.get("/:id", (req: Request, res: Response) => {
  const content = CONTENT.find((c) => c.id === req.params.id);
  if (!content) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ data: content });
});

router.get("/:id/reviews", (req: Request, res: Response) => {
  const content = CONTENT.find((c) => c.id === req.params.id);
  if (!content) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ data: content.reviews });
});

export default router;
