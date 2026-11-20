"use client";

import Image from "next/image";
import { useState } from "react";

const photos = [
  { src: "/images/land1.jpg", width: 1206, height: 1499, alt: "Оригінальна упаковка LED-лампи FAE-3920" },
  { src: "/images/land4.jpg", width: 1206, height: 874, alt: "Лампа FAE-3920 з різних ракурсів та акумуляторний відсік" },
  { src: "/images/land8.jpg", width: 1206, height: 1190, alt: "LED-лампа FAE-3920 поруч з упаковкою" },
] as const;

export function ProductGallery() {
  const [active, setActive] = useState(0);
  const photo = photos[active];

  return (
    <div className="product-gallery">
      <figure className="gallery-main" id="product-gallery-photo" aria-label="Вибране фото товару">
        <Image key={photo.src} src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="(min-width: 1280px) 570px, (min-width: 900px) 46vw, 100vw" />
      </figure>
      <div className="gallery-thumbnails" role="group" aria-label="Вибрати фото товару">
        {photos.map((item, index) => (
          <button key={item.src} type="button" className="gallery-thumbnail" aria-pressed={active === index} aria-controls="product-gallery-photo" aria-label={`Показати фото ${index + 1}: ${item.alt}`} onClick={() => setActive(index)}>
            <Image src={item.src} alt="" width={item.width} height={item.height} sizes="(min-width: 600px) 96px, 28vw" />
          </button>
        ))}
      </div>
      <p className="gallery-caption" aria-live="polite" aria-atomic="true">{photo.alt}</p>
    </div>
  );
}
