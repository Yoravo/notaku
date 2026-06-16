import { renderToBuffer } from "@react-pdf/renderer";
import type { InvoiceData } from "./types";
import { ClassicTemplate } from "./templates/classic";
import { ModernTemplate } from "./templates/modern";
import { MinimalTemplate } from "./templates/minimal";

export type { InvoiceData };

export async function renderInvoicePDF(data: InvoiceData): Promise<Buffer> {
  let element;

  if (data.isFree || !data.template || data.template === "classic") {
    element = <ClassicTemplate data={data} />;
  } else if (data.template === "modern") {
    element = <ModernTemplate data={data} />;
  } else if (data.template === "minimal") {
    element = <MinimalTemplate data={data} />;
  } else {
    element = <ClassicTemplate data={data} />;
  }

  return await renderToBuffer(element);
}
