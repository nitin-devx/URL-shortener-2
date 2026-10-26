import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

import connectDB from "./db/index.js";
import {app} from "./app.js";

const missing = ["MONGO_URL", "BASE_URL"].filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

connectDB()/// ITS store a promise
.then(()=>{
    const port = process.env.PORT || 8000;
    const server = app.listen(port, () => {
      console.log(`server is running on port ${port}`);
    });
    // 'error' (e.g. EADDRINUSE) is emitted by the HTTP server, not by the express app.
    server.on("error", (err) => {
      console.error("server error", err);
      process.exit(1);
    });
})
.catch((err)=>{
    console.error("Startup failed", err);
    process.exit(1);
});