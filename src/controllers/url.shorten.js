import { nanoid } from 'nanoid';
import Url from '../models/url.models.js';
import asyncHandler from '../utils/asyncHandler.js';

const MAX_URL_LENGTH = 2048;
const MAX_ATTEMPTS = 5;
const DUPLICATE_KEY = 11000;
const ALIAS_PATTERN = /^[A-Za-z0-9-]{3,30}$/;

const parseHttpUrl = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_URL_LENGTH) return null;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
};

const urlShorten = asyncHandler(async (req, res) => {
  const { longUrl: rawUrl, alias, expiresAt } = req.body ?? {};

  const longUrl = parseHttpUrl(rawUrl);
  if (!longUrl) {
    return res.status(400).json({ error: "longUrl must be a valid http(s) URL" });
  }

  let expiry = null;
  if (expiresAt !== undefined && expiresAt !== null && expiresAt !== "") {
    expiry = new Date(expiresAt);
    if (Number.isNaN(expiry.getTime()) || expiry <= new Date()) {
      return res.status(400).json({ error: "expiresAt must be a date in the future" });
    }
  }

  const base = process.env.BASE_URL.replace(/\/+$/, "");

  // Custom alias: one attempt; a duplicate means the name is taken (409).
  if (alias !== undefined && alias !== null && alias !== "") {
    if (typeof alias !== "string" || !ALIAS_PATTERN.test(alias)) {
      return res.status(400).json({ error: "alias must be 3-30 letters, numbers or dashes" });
    }
    try {
      await Url.create({ shortId: alias, longUrl, expiresAt: expiry });
    } catch (err) {
      if (err.code === DUPLICATE_KEY) {
        return res.status(409).json({ error: "That custom code is already taken" });
      }
      throw err;
    }
    return res.json({ short: `${base}/url/${alias}` });
  }

  // Random id: on the rare collision, retry with a new id.
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const doc = await Url.create({ shortId: nanoid(6), longUrl, expiresAt: expiry });
      return res.json({ short: `${base}/url/${doc.shortId}` });
    } catch (err) {
      if (err.code !== DUPLICATE_KEY) throw err;
    }
  }
  throw new Error("Could not generate a unique short id");
});

export default urlShorten;