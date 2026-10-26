import { nanoid } from 'nanoid';
import Url from '../models/url.models.js';


const urlShorten = async (req, res, next) => {
  try {
    const { longUrl } = req.body ?? {};

    if (typeof longUrl !== "string" || !longUrl.trim()) {
      return res.status(400).json({
        error: "A valid longUrl is required",
      });
    }

    let parsedUrl;

    try {
      parsedUrl = new URL(longUrl);
    } catch {
      return res.status(400).json({
        error: "Invalid URL format",
      });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return res.status(400).json({
        error: "Only HTTP and HTTPS URLs are allowed",
      });
    }

    const shortId = nanoid(6);

    const doc = await Url.create({
      shortId,
      longUrl: parsedUrl.toString(),
    });

    return res.status(201).json({
      short: `${process.env.BASE_URL}/${doc.shortId}`,
    });
  } catch (error) {
    next(error);
  }
};


export default urlShorten;