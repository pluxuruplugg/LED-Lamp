import Image from "next/image";

export function SpecialOffer() {
  return (
    <section className="special-offer section-space" aria-labelledby="offer-title">
      <div className="page-container offer-grid">
        <div className="offer-copy">
          <p className="eyebrow"><span className="accent-line" /> ВАША ПРОПОЗИЦІЯ</p>
          <h2 id="offer-title">Аварійна LED-лампа <span>зі знижкою 40%</span></h2>
          <p className="offer-model">FAE-3920 · 20 Вт · 5000 мА·год · E27</p>
          <div className="price-row flex flex-wrap items-center gap-4">
            <div className="price-current">299 <span>грн</span></div>
            <div className="price-previous"><del>499 грн</del><span className="discount">−40%</span></div>
          </div>
          <a href="#order" className="order-button">Замовити зі знижкою</a>
        </div>
        <figure className="offer-photo">
          <Image src="/images/land10.jpg" alt="Акційне зображення LED-лампи FAE-3920 з упаковкою та ціною 299 грн" width={1206} height={1508} sizes="(min-width: 1280px) 570px, (min-width: 900px) 48vw, 100vw" className="product-image" />
        </figure>
      </div>
    </section>
  );
}
