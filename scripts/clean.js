/**
 * Clean script — kills processes on dev ports and removes .next cache.
 *
 * Usage:  node scripts/clean.js
 *
 * This is the cross-platform equivalent of clear-ports.sh / clear-ports.ps1
 * and is invoked by the "clean" npm script in package.json.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const PORTS = [3000, 3001, 3002, 3003, 3004, 3005];

/**
 * Kill any process listening on the given port (Windows).
 */
function killPortWin32(port) {
  try {
    const output = execSync("netstat -ano -p tcp", { encoding: "utf8" });
    const lines = output
      .split("\n")
      .filter((l) => l.includes(`:${port} `) && l.includes("LISTENING"));

    for (const line of lines) {
      const pid = line.trim().split(/\s+/).pop();
      if (pid && pid !== "0") {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
          console.log(`Killed PID ${pid} on port ${port}`);
        } catch {
          // process may have already exited
        }
      }
    }
  } catch {
    // netstat may fail if no connections exist
  }
}

/**
 * Kill any process listening on the given port (macOS / Linux).
 */
function killPortUnix(port) {
  try {
    const pid = execSync(`lsof -ti:${port}`, { encoding: "utf8" }).trim();
    if (pid) {
      execSync(`kill -9 ${pid}`);
      console.log(`Killed PID ${pid} on port ${port}`);
    }
  } catch {
    // lsof returns non-zero when nothing is listening
  }
}

/**
 * Remove a directory recursively if it exists.
 */
function removeDir(dir) {
  const resolved = path.resolve(dir);
  if (fs.existsSync(resolved)) {
    fs.rmSync(resolved, { recursive: true, force: true });
    console.log(`Cleared ${dir}`);
  }
}

// --- main -----------------------------------------------------------

const killPort = os.platform() === "win32" ? killPortWin32 : killPortUnix;

for (const port of PORTS) {
  killPort(port);
}

removeDir(".next");

console.log("Done");

