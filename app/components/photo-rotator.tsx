"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useState } from "react";

export type RotatingPhoto = {
  src: StaticImageData | string;
  alt: string;
  objectPosition?: string;
};

export function PhotoRotator({
  photos,
  className = "relative aspect-square",
  interval = 4200,
}: {
  photos: RotatingPhoto[];
  className?: string;
  interval?: number;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches || photos.length < 2) return;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % photos.length);
    }, interval);

    return () => window.clearInterval(timer);
  }, [interval, photos.length]);

  return (
    <div className={`overflow-hidden rounded-lg bg-[#F1F6E7] shadow-[0_22px_55px_rgba(18,63,85,.24)] ${className}`}>
      {photos.map((photo, index) => (
        <Image
          key={photo.alt}
          src={photo.src}
          alt={photo.alt}
          fill
          preload={index === 0}
          loading={index === 0 ? undefined : "eager"}
          sizes="(max-width: 1024px) 92vw, 540px"
          quality={92}
          aria-hidden={active !== index}
          className={`object-cover transition-all duration-700 ease-out motion-reduce:transition-none ${active === index ? "scale-100 opacity-100" : "scale-[1.03] opacity-0"}`}
          style={{ objectPosition: photo.objectPosition ?? "center" }}
        />
      ))}

      <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2 rounded-full bg-[#123F55]/55 px-3 py-2 backdrop-blur-sm" aria-label={`Foto ${active + 1} de ${photos.length}`}>
        {photos.map((photo, index) => (
          <button
            key={photo.alt}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Ver foto ${index + 1}`}
            className={`h-2 rounded-full bg-white transition-all duration-300 ${active === index ? "w-7" : "w-2 opacity-55 hover:opacity-100"}`}
          />
        ))}
      </div>
    </div>
  );
}
