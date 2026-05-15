import { Router } from "express";
import { db, playersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/leaderboard", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(playersTable)
      .orderBy(desc(playersTable.xp))
      .limit(50);

    const entries = rows.map((r, i) => ({
      id: r.id,
      name: r.name,
      xp: r.xp,
      level: r.level,
      streak: r.streak,
      totalQuizzes: r.totalQuizzes,
      rank: i + 1,
    }));

    res.json(entries);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch leaderboard");
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

router.post("/leaderboard/sync", async (req, res) => {
  const { name, xp, level, streak, totalQuizzes } = req.body as {
    name: string;
    xp: number;
    level: number;
    streak: number;
    totalQuizzes: number;
  };

  if (!name || typeof xp !== "number") {
    return res.status(400).json({ error: "name and xp are required" });
  }

  try {
    const [upserted] = await db
      .insert(playersTable)
      .values({ name, xp, level, streak, totalQuizzes })
      .onConflictDoUpdate({
        target: playersTable.name,
        set: { xp, level, streak, totalQuizzes },
      })
      .returning();

    const allRows = await db
      .select()
      .from(playersTable)
      .orderBy(desc(playersTable.xp));

    const rank = allRows.findIndex((r) => r.id === upserted.id) + 1;

    return res.json({ ...upserted, rank });
  } catch (err) {
    req.log.error({ err }, "Failed to sync player");
    return res.status(500).json({ error: "Failed to sync player" });
  }
});

export default router;
