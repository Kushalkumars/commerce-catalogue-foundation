export interface OutboundEmail {
  to: string;
  replyTo: string;
  subject: string;
  text: string;
  sentAt: string;
}

/**
 * The only way the app delivers enquiry mail.
 * Swap this for SES or another provider without touching the enquiry route.
 */
export interface EmailSender {
  send(email: Omit<OutboundEmail, "sentAt">): Promise<void>;
}
