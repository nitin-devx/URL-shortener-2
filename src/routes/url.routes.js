import { Router }  from "express";
import urlShorten from "../controllers/url.shorten.js";
import urlshortId from "../controllers/url.shortId.js";
import urlstatsShortId from "../controllers/url.statsshortId.js";
import urlDelete from "../controllers/url.delete.js";

const router = Router();

router.post("/shorten", urlShorten);
router.get("/stats/:shortId", urlstatsShortId);
router.get("/:shortId", urlshortId);
router.delete("/:shortId", urlDelete);

export default router;
