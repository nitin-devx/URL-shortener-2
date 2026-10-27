import { useEffect, useState, useRef } from "react";
import "./App.css";


const API = import.meta.env.VITE_API_URL || "";
const STORAGE_KEY = "recentLinks";
const ALIAS = /^[A-Za-z0-9-]{3,30}$/;

const idFrom = (text) => text.trim().split("?")[0].replace(/\/+$/, "").split("/").pop();

const isHttpUrl = (text) => {
  try {
    const { protocol } = new URL(text);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
};

const problem = (res, data) =>
  data.error ||
  (res.status >= 500 ? "Can't reach the server. Is the backend running?" : `Request failed (${res.status})`);

const loadSaved = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
};

const statusOf = (l) => {
  if (l.gone) return "Deleted";
  if (!l.expiresAt) return "No expiry";
  const date = new Date(l.expiresAt);
  return date <= new Date() ? "Expired" : `Expires ${date.toLocaleString()}`;
};

export default function App() {
  const [longUrl, setLongUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expires, setExpires] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [link, setLink] = useState(null);
  const [copied, setCopied] = useState(false);

  const [links, setLinks] = useState(loadSaved);
  const [listError, setListError] = useState("");

  const [lookup, setLookup] = useState("");
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState("");

  // Save the list whenever it changes, so it survives a page refresh.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  }, [links]);

  // Ask the server for fresh click counts and expiry for every saved link.
  async function refresh(list) {
    const updated = await Promise.all(
      list.map(async (item) => {
        try {
          const res = await fetch(`${API}/url/stats/${encodeURIComponent(item.id)}`);
          if (res.status === 404) return { ...item, gone: true };
          if (!res.ok) return item;
          const data = await res.json();
          return { ...item, gone: false, clicks: data.clicks ?? null, expiresAt: data.expiresAt ?? null };
        } catch {
          return item;
        }
      })
    );
    setLinks((current) => current.map((c) => updated.find((u) => u.id === c.id) ?? c));
  }

  const linksRef = useRef(links);
  useEffect(() => {
    linksRef.current = links;
  }, [links]);

  useEffect(() => {
    const run = () => refresh(linksRef.current);
    run(); // when the page opens
    const timer = setInterval(run, 10000); // every 10 seconds
    window.addEventListener("focus", run); // when you return from the short link's tab
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", run);
    };
  }, []);

  async function shorten(e) {
    e.preventDefault();
    setError("");
    setLink(null);
    setCopied(false);

    const value = longUrl.trim();
    const code = alias.trim();
    if (!isHttpUrl(value)) {
      setError("Enter a full address that starts with http:// or https://");
      return;
    }
    if (code && !ALIAS.test(code)) {
      setError("A custom code needs 3–30 letters, numbers or dashes");
      return;
    }
    let expiresAt = null;
    if (expires) {
      const date = new Date(expires);
      if (date <= new Date()) {
        setError("Pick an expiry time in the future");
        return;
      }
      expiresAt = date.toISOString();
    }

    setBusy(true);
    try {
      const res = await fetch(`${API}/url/shorten`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ longUrl: value, ...(code && { alias: code }), ...(expiresAt && { expiresAt }) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(problem(res, data));
      const id = idFrom(data.short);
      const shortUrl = data.short;
      setLink({
        id,
        url: shortUrl,
        host: shortUrl.slice(0, shortUrl.length - id.length).replace(/^https?:\/\//, ""),
      });
      setLinks((cur) => [{ id, longUrl: value, expiresAt, clicks: 0 }, ...cur.filter((l) => l.id !== id)].slice(0, 20));
      setLongUrl("");
      setAlias("");
      setExpires("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(link.url);
    setCopied(true);
  }

  async function remove(id) {
    setListError("");
    try {
      const res = await fetch(`${API}/url/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok && res.status !== 404) {
        const data = await res.json().catch(() => ({}));
        throw new Error(problem(res, data));
      }
      setLinks((cur) => cur.filter((l) => l.id !== id));
    } catch (err) {
      setListError(err.message);
    }
  }

  async function loadStats(e) {
    e.preventDefault();
    setStats(null);
    setStatsError("");
    const id = idFrom(lookup);
    if (!id) return;
    try {
      const res = await fetch(`${API}/url/stats/${encodeURIComponent(id)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(problem(res, data));
      setStats(data);
    } catch (err) {
      setStatsError(err.message);
    }
  }

  return (
    <main className="page">
      <h1>Shorten a link</h1>
      <p className="lead">Paste a long address and get a short one that sends people to it.</p>

      <form onSubmit={shorten}>
        <div className="row">
          <input
            aria-label="Long address"
            inputMode="url"
            placeholder="https://example.com/a/very/long/page"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
          />
          <button disabled={busy}>{busy ? "Shortening…" : "Shorten link"}</button>
        </div>
        <div className="options">
          <label>
            Custom code (optional)
            <input placeholder="my-link" value={alias} onChange={(e) => setAlias(e.target.value)} />
          </label>
          <label>
            Expires (optional)
            <input type="datetime-local" value={expires} onChange={(e) => setExpires(e.target.value)} />
          </label>
        </div>
      </form>
      {error && <p className="error" role="alert">{error}</p>}

      {link && (
        <div className="result">
          <a className="short" href={link.url} target="_blank" rel="noreferrer">
            <span className="host">{link.host}</span>
            <strong>{link.id}</strong>
          </a>
          <button className="ghost" onClick={copy}>{copied ? "Copied" : "Copy link"}</button>
        </div>
      )}

      {links.length > 0 && (
        <section className="mylinks">
          <div className="list-head">
            <h2>Your links</h2>
            <button className="ghost small" onClick={() => refresh(links)}>Refresh clicks</button>
          </div>
          {listError && <p className="error" role="alert">{listError}</p>}
          <ul className="list">
            {links.map((l) => (
              <li key={l.id} className={l.gone ? "item gone" : "item"}>
                <div className="item-main">
                  <a className="code" href={`${API}/url/${l.id}`} target="_blank" rel="noreferrer">{l.id}</a>
                  <span className="dest">{l.longUrl}</span>
                  <span className="meta">
                    <span>{l.clicks ?? "–"} clicks</span>
                    <span>{statusOf(l)}</span>
                  </span>
                </div>
                <button className="ghost small danger" onClick={() => remove(l.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <hr />

      <h2>Check a link</h2>
      <form className="row" onSubmit={loadStats}>
        <input
          aria-label="Short link or code"
          placeholder="Short link or code"
          value={lookup}
          onChange={(e) => setLookup(e.target.value)}
        />
        <button>Show stats</button>
      </form>
      {statsError && <p className="error" role="alert">{statsError}</p>}

      {stats && (
        <dl className="stats">
          <dt>Goes to</dt>
          <dd className="break">{stats.longUrl}</dd>
          <dt>Created</dt>
          <dd>{new Date(stats.createdAt).toLocaleString()}</dd>
          <dt>Clicks</dt>
          <dd>{stats.clicks ?? "Not tracked by this server"}</dd>
          <dt>Expires</dt>
          <dd>{stats.expiresAt ? new Date(stats.expiresAt).toLocaleString() : "Never"}</dd>
        </dl>
      )}
    </main>
  );
}
