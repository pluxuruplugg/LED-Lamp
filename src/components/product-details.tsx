import { ProductGallery } from "./product-gallery";

const specifications = [
  ["Назва", "Аварійна LED-лампа FAE-3920"],
  ["Потужність", "20 Вт"],
  ["Акумулятор", "5000 мА·год"],
  ["Цоколь", "E27"],
  ["Колірна температура", "6500 К"],
  ["Живлення", "AC 85–265 В"],
  ["Автономна робота", "6–8 годин"],
] as const;

export function ProductDetails() {
  return (
    <section className="product-details section-space" aria-labelledby="details-title">
      <div className="page-container">
        <div className="stage-heading">
          <p className="eyebrow"><span className="accent-line" /> БЛИЖЧЕ ДО ДЕТАЛЕЙ</p>
          <h2 id="details-title">Знайомтеся: <span className="warm-text">FAE-3920</span></h2>
        </div>
        <div className="details-grid">
          <ProductGallery />
          <div className="specifications">
            <h3>Характеристики лампи</h3>
            <table className="specification-table">
              <caption className="sr-only">Характеристики аварійної LED-лампи FAE-3920</caption>
              <tbody>{specifications.map(([label, value]) => <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>)}</tbody>
            </table>
            <p className="specification-note">6–8 годин — заявлена тривалість автономної роботи.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
