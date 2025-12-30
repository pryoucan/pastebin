import { Router } from "express";
import { htmlPasteView } from "../controllers/pastebin.controller.js";

export const htmlViewroute = Router();

htmlViewroute.get("/:id", htmlPasteView);