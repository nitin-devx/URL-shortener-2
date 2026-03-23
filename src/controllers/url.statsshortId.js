import Url from "../models/url.models.js";





const urlstatsShortId = async (req, res) => {
  const doc = await Url.findOne({ shortId: req.params.shortId });
  if (!doc) return res.status(404).json({ error: 'URL not found' });
  res.json(doc);
};

export default urlstatsShortId;
