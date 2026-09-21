import app from "./app.js";
import { env } from "./config/env.js";

const PORT = env.port;

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