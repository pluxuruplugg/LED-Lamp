"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { prepareOrder, validateOrder, type OrderErrors } from "@/lib/order";

export function OrderForm() {
  const [errors, setErrors] = useState<OrderErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [ready, setReady] = useState(false);
  const locked = useRef(false);
  const attempt = useRef<{ signature: string; requestId: string } | null>(null);

  // Prevent native submission before hydration or when JavaScript is disabled.
  useEffect(() => { setReady(true); }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current) return;
    locked.current = true;
    const form = event.currentTarget;
    const data = new FormData(form);
    const fields = { name: String(data.get("name") ?? ""), phone: String(data.get("phone") ?? "") };
    const nextErrors = validateOrder(fields);
    setErrors(nextErrors);
    setStatus("idle");
    const firstInvalid = nextErrors.name ? "name" : nextErrors.phone ? "phone" : null;
    if (firstInvalid) {
      locked.current = false;
      (form.elements.namedItem(firstInvalid) as HTMLInputElement).focus();
      return;
    }
    setStatus("sending");
    try {
      const customer = prepareOrder(fields);
      const signature = JSON.stringify(customer);
      if (!attempt.current || attempt.current.signature !== signature) {
        attempt.current = { signature, requestId: crypto.randomUUID() };
      }
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...customer, requestId: attempt.current.requestId }),
      });
      const result: unknown = await response.json();
      if (!response.ok || !result || typeof result !== "object" || !("success" in result) || result.success !== true) throw new Error("Order rejected");
      form.reset();
      attempt.current = null;
      setStatus("success");
    } catch {
      // Keep fields and the requestId for a safe customer-initiated retry.
      setStatus("error");
    } finally {
      locked.current = false;
    }
  }

  function handleChange() {
    if (locked.current) return;
    setStatus("idle");
    setErrors({});
  }

  return (
    <section id="order" className="order-section section-space" aria-labelledby="order-title">
      <div className="page-container">
        <div className="stage-heading">
          <p className="eyebrow"><span className="accent-line" /> ВАШЕ СВІТЛО ПОРУЧ</p>
          <h2 id="order-title">Замовте аварійну LED-лампу <span className="warm-text">вже зараз</span></h2>
        </div>
        <div className="order-panel">
          <div className="order-product">
            <div className="order-product-photo"><Image src="/images/land6.jpg" alt="Аварійна LED-лампа FAE-3920 з цоколем E27" width={1206} height={1508} sizes="(min-width: 900px) 300px, 70vw" className="product-image" /></div>
            <div className="order-product-summary">
              <h3>FAE-3920</h3><p>Аварійна LED-лампа</p>
              <div className="price-row flex flex-wrap items-center gap-4">
                <div className="price-current">299 <span>грн</span></div>
                <div className="price-previous"><del>499 грн</del><span className="discount">−40%</span></div>
              </div>
            </div>
          </div>
          <form className="order-form" noValidate onSubmit={handleSubmit} onChange={handleChange} aria-describedby="order-availability">
            <p id="order-availability" className="order-availability">Залиште ваше ім’я та номер телефону для підтвердження замовлення.</p>
            <div className="form-field">
              <label htmlFor="order-name">Ваше ім’я</label>
              <input id="order-name" name="name" type="text" autoComplete="name" placeholder="Введіть ваше ім’я" required minLength={2} maxLength={80} readOnly={status === "sending"} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} />
              {errors.name && <p id="name-error" className="field-error" role="alert">{errors.name}</p>}
            </div>
            <div className="form-field">
              <label htmlFor="order-phone">Номер телефону</label>
              <input id="order-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+380 XX XXX XX XX" required maxLength={32} readOnly={status === "sending"} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "phone-hint phone-error" : "phone-hint"} />
              <p id="phone-hint" className="field-hint">Наприклад: +380 67 123 45 67</p>
              {errors.phone && <p id="phone-error" className="field-error" role="alert">{errors.phone}</p>}
            </div>
            <button type="submit" className="order-button" disabled={!ready || status === "sending"} aria-busy={status === "sending"}>{status === "sending" ? "Відправляємо замовлення..." : "Оформити замовлення"}</button>
            <noscript><p className="field-hint">Увімкніть JavaScript, щоб надіслати замовлення.</p></noscript>
            <div className="order-feedback" role="status" aria-live="polite" aria-atomic="true">
              {status === "success" && <p>Дякуємо! Ваше замовлення прийнято. Ми зв’яжемося з вами найближчим часом</p>}
              {status === "error" && <p>Не вдалося відправити замовлення. Спробуйте ще раз</p>}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
