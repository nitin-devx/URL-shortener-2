import Url from "../models/url.models.js";
import asyncHandler from "../utils/asyncHandler.js";

const urlshortId = asyncHandler(async(req,res)=>{
  const {shortId} =req.params;

  // Only count a click (and redirect) if the link has no expiry or it is still in the future.
  const doc = await Url.findOneAndUpdate(
    { shortId, $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] },
    { $inc: { clicks: 1 } },
    { new: true }
  );
  if (doc) return res.redirect(302, doc.longUrl);

  // Not found above: either it does not exist (404) or it has expired (410).
  const exists = await Url.exists({ shortId });
  if (exists) return res.status(410).json({ error: "This link has expired" });
  res.status(404).json({ error: "URL not found" });
});


export default urlshortId;