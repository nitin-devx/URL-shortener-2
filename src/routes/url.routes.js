import { Router }  from "express";
import urlShorten from "../controllers/url.shorten.js";
import urlshortId from "../controllers/url.shortid.js";
import urlstatsShortId from "../controllers/url.statsshortId.js";

const router = Router();

router.route("/shorten").post(urlShorten);
router.route("/:shortId").get(urlshortId);
router.route("/stats/:shortId").get(urlstatsShortId)
export default router;