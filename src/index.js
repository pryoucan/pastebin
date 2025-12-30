import 'dotenv/config';
import express from "express";
import { route } from "./routes/paste.route.js";
import { htmlViewroute } from "./routes/html_view.route.js";
import { htmlCreateRoute } from './routes/html_create.route.js';


const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

app.use("/api", route);
app.use("/", htmlCreateRoute);
app.use("/p", htmlViewroute);

app.listen(PORT, () => {
    console.log(`server is running on:${PORT}`)
})