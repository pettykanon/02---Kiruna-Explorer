// 02-Kiruna-Explorer/kiruna-explorer-server/routes/AreaRoutes.mjs
import express from 'express';
import AreaDAO from "../dao/AreaDAO.mjs";
import { body, validationResult } from "express-validator";
import { isLoggedIn } from "../auth/authMiddleware.mjs";
const router = express.Router();
const areaDao = new AreaDAO();
import { AreaNotFound } from "../models/Area.mjs";
import { authorizeRoles } from "../auth/authMiddleware.mjs";

/* GET /api/areas - Get all areas */
router.get("/", isLoggedIn, async (req, res) => {
    try {
        const areas = await areaDao.getAllAreas();
        res.status(200).json(areas);
    } catch (err) {
        if (err instanceof AreaNotFound) {
            res.status(404).json({ error: "Area not found" });
        }
        console.error("Error fetching areas:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/areas - Create a new area
router.post("/", isLoggedIn, authorizeRoles('admin', 'urban_planner'),
    [
        body("geoJson")
            .trim()
            .notEmpty().withMessage("GeoJSON is required")
            //.isString().withMessage("GeoJSON must be a string")
    ],
    async (req, res) => {
        console.log(req.body)
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const geoJson = req.body.geoJson
            const area = await areaDao.addArea(geoJson);
            res.status(201).json(area);
    } catch (err) {
        console.error("Error creating area:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;