import { nanoid } from 'nanoid';
import Url from '../models/url.models.js';


const urlShorten = async (req, res) => {
  const { longUrl } = req.body;
  if (!longUrl) return res.status(400).json({ error: 'longUrl is required' });

  const shortId = nanoid(6);
  const doc = await Url.create({ shortId, longUrl });

  res.json({ short: `${process.env.BASE_URL}/${doc.shortId}` });
};


export default urlShorten;