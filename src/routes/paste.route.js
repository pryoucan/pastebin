import { Router } from "express";
import { checkHealth, createPaste, getPaste } from "../controllers/pastebin.controller.js";

export const route = Router();

route.get("/healthz", checkHealth);
route.post("/pastes", createPaste);
route.get("/pastes/:id", getPaste);