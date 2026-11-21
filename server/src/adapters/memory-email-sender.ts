import type { EmailSender, OutboundEmail } from "../ports/email-sender.js";

/**
 * Proof-of-concept mailbox. Stores the message the sales inbox would receive
 * and prints it to the server log. No SMTP account is required.
 */
export class MemoryEmailSender implements EmailSender {
  private readonly messages: OutboundEmail[] = [];

  async send(email: Omit<OutboundEmail, "sentAt">): Promise<void> {
    const stored: OutboundEmail = { ...email, sentAt: new Date().toISOString() };
    this.messages.push(stored);
    console.log(
      `[sales-inbox] to=${stored.to} replyTo=${stored.replyTo} subject="${stored.subject}"`,
    );
  }

  list(): OutboundEmail[] {
    return [...this.messages].reverse();
  }
}
