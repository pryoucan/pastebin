import { Router } from "express";
import { htmlCreateView } from "../controllers/pastebin.controller.js";

export const htmlCreateRoute = Router();

htmlCreateRoute.get("/", htmlCreateView);