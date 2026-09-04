import { Router } from "express";
import Machine from "../models/Machine.js";
import { allowRoles } from "../middleware/auth.js";

const router = Router();
const editors = ["superadmin", "factory", "maintmgr"];

router.get("/", async (req, res, next) => {
  try {
    const machines = await Machine.find().sort({ assetTag: 1 });
    res.json({ machines });
  } catch (error) { next(error); }
});

router.post("/", allowRoles(...editors), async (req, res, next) => {
  try {
    const machine = await Machine.create(req.body);
    res.status(201).json({ machine });
  } catch (error) { next(error); }
});

router.patch("/:id", allowRoles(...editors), async (req, res, next) => {
  try {
    const machine = await Machine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!machine) return res.status(404).json({ message: "Machine not found" });
    res.json({ machine });
  } catch (error) { next(error); }
});

export default router;
