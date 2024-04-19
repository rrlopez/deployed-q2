import { promises as fs } from "fs";
import path from "path";
import prisma from "../prisma/prismaClient";
import { CronJob } from "cron";
import xml2js from "xml2js";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrBefore);

async function processOrder(order_details: { order_id: number }) {
  prisma.order_detail.create({ data: order_details });
}

new CronJob(
  "0 * * * *",
  async function () {
    //download all xml files from the api
    let xmlFiles = await fs.readdir("/data");

    // filter out files created 1 hrs ago
    const twentyFourHoursAgo = dayjs(new Date()).add(1, "hour").toDate();
    xmlFiles = xmlFiles.filter(async (file) => {
      const filePath = path.join("/data", file);
      const stats = await fs.stat(filePath);
      return stats.birthtime > twentyFourHoursAgo;
    });

    // get all orders with no order details
    const orders = await prisma.order_detail.findMany({
      where: { customer: { equals: null } },
    });
    orders.forEach(async (order) => {
      // find the relevant file for each order
      let details: any = null;
      for (let i = 0; i < xmlFiles.length; i++) {
        const result = await xml2js.parseStringPromise(xmlFiles[i]);
        if (result.id === order.id) {
          details = result;
          break;
        }
      }
      if (!details) return;

      // update order
      await prisma.order_detail.update({
        where: { order_id: details.order_id },
        data: details,
      });
    });
  },
  null,
  true
);

export default processOrder;
