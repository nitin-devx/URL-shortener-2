import Url from "../models/url.models.js";
import asyncHandler from "../utils/asyncHandler.js";

// NOTE: no authentication yet, so anyone who knows a code can delete that link.
const urlDelete = asyncHandler(async (req, res) => {
  const doc = await Url.findOneAndDelete({ shortId: req.params.shortId });
  if (!doc) return res.status(404).json({ error: "URL not found" });
  res.status(204).end();
});

export default urlDelete;
