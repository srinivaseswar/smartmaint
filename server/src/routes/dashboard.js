import { Router } from "express";
import Machine from "../models/Machine.js";

const router = Router();

router.get("/summary", async (req, res, next) => {
  try {
    const [machineCounts, downCount] = await Promise.all([
      Machine.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Machine.countDocuments({ status: "Down" })
    ]);
    const byStatus = Object.fromEntries(machineCounts.map(({ _id, count }) => [_id, count]));
    const total = Object.values(byStatus).reduce((sum, count) => sum + count, 0);
    res.json({ uptime: total ? Math.round(((total - downCount) / total) * 100) : 0, machines: byStatus, openWorkOrders: 0, activeBreakdowns: downCount, lowStockParts: 0 });
  } catch (error) { next(error); }
});

export default router;
