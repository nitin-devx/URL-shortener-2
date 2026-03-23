import Url from "../models/url.models.js";



const urlshortId= async (req, res) => {
  const doc = await Url.findOneAndUpdate(
    { shortId: req.params.shortId },
    { new: true }
  );
  if (!doc) return res.status(404).json({ error: 'URL not found' });

  res.redirect(302, doc.longUrl);
};


export default urlshortId;