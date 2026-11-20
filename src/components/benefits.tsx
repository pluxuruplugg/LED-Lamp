import Image from "next/image";
import { Icon } from "./icon";

const benefits = [
  { icon: "bolt", title: "Потужність 20 Вт", text: "LED-лампа із заявленою потужністю 20 Вт.", image: "land6", width: 1206, height: 1508, alt: "LED-лампа FAE-3920 у повний зріст" },
  { icon: "battery", title: "Акумулятор 5000 мА·год", text: "Вбудований акумулятор для роботи без електромережі.", image: "land7", width: 952, height: 1190, alt: "Акумуляторний відсік лампи FAE-3920" },
  { icon: "socket", title: "Стандартний цоколь E27", text: "Різьбовий цоколь для світильників із патроном E27.", image: "land5", width: 883, height: 1104, alt: "Різьбовий цоколь E27 лампи та знімний тримач" },
  { icon: "clock", title: "Автономна робота 6–8 годин", text: "Заявлена тривалість роботи від вбудованого акумулятора." },
] as const;

export function Benefits() {
  return (
    <section className="benefits section-space" aria-labelledby="benefits-title">
      <div className="page-container">
        <div className="benefits-heading">
          <p className="eyebrow"><span className="accent-line" /> ДЕТАЛІ, ЩО МАЮТЬ ЗНАЧЕННЯ</p>
          <h2 id="benefits-title">Переваги аварійної <span>LED-лампи FAE-3920</span></h2>
        </div>
        <div className="benefits-grid">
          {benefits.map((benefit) => (
            <article key={benefit.icon} className={`benefit-card ${benefit.icon === "clock" ? "benefit-autonomy" : ""}`}>
              {"image" in benefit ? (
                <div className="benefit-photo"><Image src={`/images/${benefit.image}.jpg`} alt={benefit.alt} width={benefit.width} height={benefit.height} sizes="(min-width: 1200px) 280px, (min-width: 900px) 25vw, (min-width: 600px) 50vw, 100vw" className="product-image" /></div>
              ) : (
                <div className="duration-visual" aria-hidden="true"><div className="clock-halo"><Icon name="clock" /></div><p>6–8<span>годин світла</span></p></div>
              )}
              <div className="benefit-body">
                <span className="benefit-icon"><Icon name={benefit.icon} /></span>
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
