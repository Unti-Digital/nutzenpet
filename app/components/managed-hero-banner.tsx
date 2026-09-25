import Link from "next/link";

type ManagedHeroBannerProps = {
  title: string;
  alt: string;
  desktopImage: string;
  mobileImage: string;
  href: string;
};

export function ManagedHeroBanner({ title, alt, desktopImage, mobileImage, href }: ManagedHeroBannerProps) {
  const artwork = (
    <picture className="block h-full w-full">
      <source media="(max-width: 639px)" srcSet={mobileImage || desktopImage} />
      <img
        src={desktopImage}
        alt={alt || title}
        className="h-full w-full object-cover"
        loading="eager"
        decoding="async"
        fetchPriority="high"
      />
    </picture>
  );

  if (!href) return artwork;
  if (href.startsWith("/")) return <Link href={href} aria-label={title}>{artwork}</Link>;
  return <a href={href} aria-label={title}>{artwork}</a>;
}
