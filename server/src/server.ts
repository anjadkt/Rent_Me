import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";

const PORT = env.port;

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`
        ╔══════════════════════════════════════════════╗
        ║           SERVER STARTED                     ║
        ╠══════════════════════════════════════════════╣
        ║ Environment : ${env.nodeEnv}                 
        ║ Port        : ${PORT}                        
        ║ URL         : http://localhost:${PORT}       
        ║ Health      : http://localhost:${PORT}/health
        ╚══════════════════════════════════════════════╝
      `);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();