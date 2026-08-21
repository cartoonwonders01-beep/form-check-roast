import { onRequestPost as __api_roast_js_onRequestPost } from "/Users/andyb/My Drive (andy.j.baxter@gmail.com)/Antigravity/Hackathon-Fitness-App/client/functions/api/roast.js"

export const routes = [
    {
      routePath: "/api/roast",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_roast_js_onRequestPost],
    },
  ]