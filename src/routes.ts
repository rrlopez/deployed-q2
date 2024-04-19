import Router from "koa-router";
import processOrder from "./orderAPI";

export const router = new Router();

router.get("/notification-webhook", async (ctx, next) => {
	const {order_details} = ctx.body
	processOrder(order_details)
  ctx.body('order received')
});