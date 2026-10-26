import express from "express";
import cors from "cors";
import router from "./routes/url.routes.js";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json({ limit: "16kb" }));

app.use("/url", router); 

// Central error handler: turns thrown errors into JSON responses instead of hanging or crashing.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status < 500 ? err.message : "Internal server error" });
});

export { app };