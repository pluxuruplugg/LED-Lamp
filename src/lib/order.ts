export type OrderFields = { name: string; phone: string };
export type OrderErrors = Partial<Record<keyof OrderFields, string>>;

// Shared validation is repeated by the server before contacting the CRM.
export function validateOrder(fields: OrderFields): OrderErrors {
  const errors: OrderErrors = {};
  const name = fields.name.trim();
  const phone = fields.phone.trim();
  const digits = phone.replace(/\D/g, "");

  if (!name) errors.name = "Вкажіть ваше ім’я.";
  else if (name.length < 2 || name.length > 80 || !/^[\p{L}\p{M}\s’'ʼ.\-]+$/u.test(name) || !/\p{L}.*\p{L}/u.test(name)) {
    errors.name = "Введіть ім’я від 2 до 80 символів, використовуючи літери.";
  }

  if (!phone) errors.phone = "Вкажіть номер телефону.";
  else if (phone.length > 32 || !/^\+?[\d\s().-]+$/.test(phone) || digits.length < 10 || digits.length > 15 || /^(\d)\1+$/.test(digits)) {
    errors.phone = "Введіть номер із 10–15 цифр. Можна додати +, пробіли, дужки або дефіси.";
  }

  return errors;
}

export function prepareOrder(fields: OrderFields) {
  const digits = fields.phone.replace(/\D/g, "");
  const phone = /^0\d{9}$/.test(digits) ? `+38${digits}` : fields.phone.trim().startsWith("+") || /^380\d{9}$/.test(digits) ? `+${digits}` : digits;
  return { name: fields.name.trim().replace(/\s+/g, " "), phone };
}
