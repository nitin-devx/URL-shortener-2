import Url from "../models/url.models.js";
import asyncHandler from "../utils/asyncHandler.js";




const urlstatsShortId = asyncHandler(async (req, res) => {
  const doc = await Url.findOne({ shortId: req.params.shortId });
  if (!doc) return res.status(404).json({ error: "URL not found" });
  res.json(doc);
});

export default urlstatsShortId;
