import { renderToBuffer } from "@react-pdf/renderer";
import type { ReceiptData } from "./types";
import { ReceiptTemplate } from "./templates/receipt";

export type { ReceiptData };

export async function renderReceiptPDF(data: ReceiptData): Promise<Buffer> {
  const element = <ReceiptTemplate data={data} />;
  return await renderToBuffer(element);
}
