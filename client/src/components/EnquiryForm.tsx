import { FormEvent, useState } from "react";
import { ApiError, api } from "../api";
import type { FieldError } from "../types";

export function EnquiryForm({ productId }: { productId: number }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="thanks" role="status">
        <h2>Thank you</h2>
        <p>Your enquiry is with the sales team. They can reply to the email address you gave.</p>
        <p className="fine-print">
          This proof of concept keeps that email in the local sales inbox at{" "}
          <a href="/api/dev/inbox">/api/dev/inbox</a>.
        </p>
      </div>
    );
  }

  function fieldMessage(field: string) {
    return errors.find((issue) => issue.field === field)?.message;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setFormError("");
    setErrors([]);
    try {
      await api.enquire({ productId, name, email, message });
      setSent(true);
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
        setErrors(error.details);
      } else {
        setFormError("We could not send that just now. Please try again.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="enquiry" onSubmit={onSubmit}>
      <h2>Enquire</h2>
      <p>Tell sales how to reach you. No account is required.</p>
      {formError && <p className="form-error">{formError}</p>}
      <label>
        Name
        <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
        {fieldMessage("name") && <span className="field-error">{fieldMessage("name")}</span>}
      </label>
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
        />
        {fieldMessage("email") && <span className="field-error">{fieldMessage("email")}</span>}
      </label>
      <label>
        Message
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
        />
        {fieldMessage("message") && <span className="field-error">{fieldMessage("message")}</span>}
      </label>
      <button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}
