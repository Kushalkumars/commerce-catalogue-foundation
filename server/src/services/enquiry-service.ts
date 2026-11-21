import { z } from "zod";
import type { EmailSender } from "../ports/email-sender.js";
import type { CatalogueService } from "./catalogue-service.js";

export const enquirySchema = z.object({
  productId: z.number().int().positive(),
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  message: z.string().trim().min(10).max(1000),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

export class EnquiryError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export class EnquiryService {
  constructor(
    private readonly catalogue: CatalogueService,
    private readonly email: EmailSender,
    private readonly salesInbox: string,
  ) {}

  async submit(input: EnquiryInput): Promise<void> {
    const product = await this.catalogue.getProduct(input.productId);
    if (!product) throw new EnquiryError("Product not found", 404);

    await this.email.send({
      to: this.salesInbox,
      replyTo: input.email,
      subject: `Enquiry: ${product.title}`,
      text: [
        `${input.name} <${input.email}> asked about product ${product.id}.`,
        "",
        product.title,
        `$${product.price.toFixed(2)} · ${product.category}`,
        "",
        input.message,
      ].join("\n"),
    });
  }
}
