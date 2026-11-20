import Image from "next/image";
import { Icon } from "./icon";

export function EmergencyLighting() {
  return (
    <section className="emergency section-space" aria-labelledby="emergency-title">
      <div className="page-container emergency-grid">
        <div className="emergency-copy">
          <p className="eyebrow"><span className="accent-line" /> КОЛИ ЗНИКАЄ ЕЛЕКТРОЕНЕРГІЯ</p>
          <h2 id="emergency-title">Світло навіть <span>без електроенергії</span></h2>
          <p className="section-description">Аварійна LED-лампа FAE-3920 призначена для освітлення під час відключень. Вбудований акумулятор дає змогу використовувати лампу без живлення від мережі.</p>
          <div className="autonomy flex items-center gap-4">
            <span className="autonomy-icon"><Icon name="clock" /></span>
            <div><p className="autonomy-value">6–8 годин</p><p className="autonomy-label">заявленої автономної роботи</p></div>
          </div>
        </div>
        <div className="emergency-photos">
          <figure className="emergency-photo photo-lit">
            <Image src="/images/land2.jpg" alt="FAE-3920 з увімкненим світлом" width={1206} height={1185} sizes="(min-width: 1200px) 350px, (min-width: 900px) 29vw, 100vw" className="product-image" />
            <figcaption>Світло від акумулятора</figcaption>
          </figure>
          <figure className="emergency-photo photo-detail">
            <Image src="/images/land3.jpg" alt="Корпус аварійної LED-лампи FAE-3920" width={1206} height={1183} sizes="(min-width: 1200px) 270px, (min-width: 900px) 23vw, 100vw" className="product-image" />
            <figcaption>Лампа FAE-3920</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
