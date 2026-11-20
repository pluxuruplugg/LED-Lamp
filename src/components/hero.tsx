import Image from "next/image";
import { Icon } from "./icon";

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="page-container">
        <header className="hero-header flex items-center justify-between gap-4">
          <a href="#" className="brand inline-flex items-center gap-2.5" aria-label="FAE-3920 — на початок">
            <span className="brand-icon"><Icon name="bulb" /></span>
            <span>FAE<span className="brand-model"> / 3920</span></span>
          </a>
          <span className="header-caption">Аварійне освітлення</span>
        </header>

        <div className="hero-grid">
          <div className="hero-intro">
            <p className="eyebrow"><span className="accent-line" /> СВІТЛО, ЩО ЗАЛИШАЄТЬСЯ</p>
            <h1 id="hero-title">Світло навіть <span className="hero-title-soft">під час відключень</span> електроенергії</h1>
            <p className="hero-description">Аварійна LED-лампа FAE-3920 із вбудованим акумулятором</p>
            <ul className="hero-specs flex flex-wrap gap-2" aria-label="Основні переваги">
              <li><Icon name="bolt" />20 Вт</li>
              <li><Icon name="battery" />5000 мА·год</li>
              <li><Icon name="socket" />Цоколь E27</li>
            </ul>
          </div>

          <figure className="hero-visual">
            <div className="hero-photo">
              <Image src="/images/land8.jpg" alt="Аварійна LED-лампа FAE-3920 поруч з оригінальною упаковкою" width={1206} height={1190} sizes="(min-width: 1280px) 580px, (min-width: 900px) 48vw, 100vw" preload className="product-image" />
            </div>
            <figcaption className="flex items-center justify-between gap-3"><span>FAE-3920</span><span>LED-лампа з акумулятором</span></figcaption>
          </figure>

          <div className="hero-offer">
            <div className="price-row flex flex-wrap items-center gap-4">
              <div className="price-current">299 <span>грн</span></div>
              <div className="price-previous"><del>499 грн</del><span className="discount">−40%</span></div>
            </div>
            <a href="#order" className="order-button">Замовити зараз</a>
          </div>
        </div>
      </div>
    </section>
  );
}
