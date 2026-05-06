import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createServerBootstrap } from "../../server/world/bootstrap";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const bootstrap = createServerBootstrap();
  res.status(200).json(bootstrap);
}

