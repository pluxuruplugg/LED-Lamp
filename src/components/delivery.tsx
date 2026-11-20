import Image from "next/image";

const steps = [
  { title: "Залиште заявку", text: "Заповніть форму замовлення на сайті." },
  { title: "Підтвердіть замовлення", text: "Дочекайтеся дзвінка менеджера для уточнення деталей." },
  { title: "Отримайте товар", text: "Отримайте своє замовлення обраним способом доставки." },
];

export function Delivery() {
  return (
    <section className="delivery section-space" aria-labelledby="delivery-title">
      <div className="page-container">
        <div className="stage-heading">
          <p className="eyebrow"><span className="accent-line" /> ВІД ЗАЯВКИ ДО ОТРИМАННЯ</p>
          <h2 id="delivery-title">Як оформити <span className="warm-text">замовлення</span></h2>
        </div>
        <div className="delivery-grid">
          <figure className="delivery-photo framed-photo">
            <Image src="/images/delivery.png" alt="Ілюстрація етапів замовлення: заявка на сайті, дзвінок, надсилання та отримання товару" width={1254} height={1254} sizes="(min-width: 1280px) 600px, (min-width: 900px) 48vw, 100vw" className="product-image" />
          </figure>
          <ol className="delivery-steps">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className="step-number" aria-hidden="true">0{index + 1}</span>
                <div><h3>{step.title}</h3><p>{step.text}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
