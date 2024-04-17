import { defineConfig } from "vite";
import fs from "node:fs";
import { log } from "node:console";

const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));
log(packageJson.version);

export default defineConfig({
  base: "/kita-ampel",
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version || "0"),
  },
});
