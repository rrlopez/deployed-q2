import Koa from "koa";
import cors from "@koa/cors";
import json from 'koa-json'
import bodyParser from 'koa-bodyparser'
import { router } from "./routes";

const app = new Koa();

app.use(json())
app.use(bodyParser())
app.use(cors());
app.use(router.routes()).use(router.allowedMethods());

const port = 3232;

app.listen(port, () => {
  console.log(`🚀 Server is running on port http://localhost:${port}/`);
});