import { renderToBuffer } from "@react-pdf/renderer";
import type { DeliveryOrderData } from "./types";
import { DeliveryOrderTemplate } from "./templates/delivery-order";

export type { DeliveryOrderData };

export async function renderDeliveryOrderPDF(data: DeliveryOrderData): Promise<Buffer> {
  const element = <DeliveryOrderTemplate data={data} />;
  return await renderToBuffer(element);
}
