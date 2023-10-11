import { defineConfig } from "astro/config"
import dotenv from "dotenv"

import react from "@astrojs/react"
dotenv.config({ path: "./.env" })

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  server: { port: parseInt(process.env.FRONTEND_PORT), host: true },
})
