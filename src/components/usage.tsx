import Image from "next/image";

export function Usage() {
  return (
    <section className="usage section-space" aria-labelledby="usage-title">
      <div className="page-container usage-grid">
        <div className="usage-copy">
          <p className="eyebrow"><span className="accent-line" /> У ЗВИЧНИХ МІСЦЯХ</p>
          <h2 id="usage-title">Світло там, <span className="warm-text">де воно потрібне</span></h2>
          <ul className="usage-places" aria-label="Приклади використання">
            {["Кухня", "Коридор", "Робоче місце", "Дача"].map((place) => <li key={place}>{place}</li>)}
          </ul>
        </div>
        <figure className="usage-photo framed-photo">
          <Image src="/images/land9.jpg" alt="Приклади освітлення з лампою: кухня, коридор, робоче місце та дача" width={1206} height={1595} sizes="(min-width: 1280px) 680px, (min-width: 900px) 55vw, 100vw" className="product-image" />
        </figure>
      </div>
    </section>
  );
}
