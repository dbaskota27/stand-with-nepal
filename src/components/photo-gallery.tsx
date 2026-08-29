import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { photos, type Photo } from "@/data/relief";
import { cn } from "@/lib/utils";

function Lightbox({
  index,
  onClose,
  onPrev,
  onNext,
}: {
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const photo = photos[index];

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onPrev, onNext]);

  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-bg/95"
      role="dialog"
      aria-modal="true"
      aria-label="Photograph"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <p className="text-sm text-muted">
          {index + 1} / {photos.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex size-11 items-center justify-center rounded-md text-fg hover:bg-fg/8"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4">
        <button
          type="button"
          onClick={onPrev}
          className="absolute left-2 top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-md bg-surface/80 text-fg hover:bg-surface md:inline-flex"
          aria-label="Previous photo"
        >
          <ChevronLeft className="size-5" />
        </button>
        <img
          src={photo.src}
          alt={photo.alt}
          className="max-h-[72vh] w-full max-w-5xl object-contain"
        />
        <button
          type="button"
          onClick={onNext}
          className="absolute right-2 top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-md bg-surface/80 text-fg hover:bg-surface md:inline-flex"
          aria-label="Next photo"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
      <div className="mx-auto w-full max-w-3xl px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <p className="text-base text-fg">{photo.caption}</p>
        <a
          href={photo.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block text-sm text-muted underline-offset-4 hover:text-fg hover:underline"
        >
          Photo via {photo.credit}
        </a>
        <div className="mt-3 flex gap-2 md:hidden">
          <button
            type="button"
            onClick={onPrev}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-border bg-surface"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={onNext}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-border bg-surface"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function Thumb({
  photo,
  className,
  onOpen,
}: {
  photo: Photo;
  className?: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group relative block overflow-hidden rounded-lg bg-surface text-left",
        className,
      )}
    >
      <img
        src={photo.src}
        alt={photo.alt}
        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-bg/80 to-transparent p-3 pt-10 text-left text-xs text-fg opacity-100 md:opacity-0 md:transition-opacity md:duration-200 md:group-hover:opacity-100">
        {photo.caption}
      </span>
    </button>
  );
}

export function PhotoGallery() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="photos" className="scroll-mt-24 px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">
          From the ground
        </p>
        <h2 className="mt-3 font-display text-3xl text-fg md:text-4xl">
          What the flood left behind
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
          Photographs from international news coverage of the 26 August 2026
          disaster. Tap any image to view it larger. Credits link to the original
          reports.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
          <Thumb
            photo={photos[0]}
            onOpen={() => setOpen(0)}
            className="col-span-2 aspect-[16/10] md:row-span-2 md:aspect-auto md:h-full"
          />
          <Thumb
            photo={photos[1]}
            onOpen={() => setOpen(1)}
            className="aspect-[4/3]"
          />
          <Thumb
            photo={photos[2]}
            onOpen={() => setOpen(2)}
            className="aspect-[4/3]"
          />
          <Thumb
            photo={photos[3]}
            onOpen={() => setOpen(3)}
            className="aspect-[4/3]"
          />
          <Thumb
            photo={photos[4]}
            onOpen={() => setOpen(4)}
            className="aspect-[4/3]"
          />
          <Thumb
            photo={photos[5]}
            onOpen={() => setOpen(5)}
            className="col-span-2 aspect-[16/10]"
          />
          <Thumb
            photo={photos[6]}
            onOpen={() => setOpen(6)}
            className="aspect-[4/3]"
          />
          <Thumb
            photo={photos[7]}
            onOpen={() => setOpen(7)}
            className="aspect-[4/3]"
          />
          <Thumb
            photo={photos[8]}
            onOpen={() => setOpen(8)}
            className="col-span-2 aspect-[16/9] md:col-span-4"
          />
        </div>
      </div>

      {open !== null && (
        <Lightbox
          index={open}
          onClose={() => setOpen(null)}
          onPrev={() => setOpen((i) => (i === null ? 0 : (i + photos.length - 1) % photos.length))}
          onNext={() => setOpen((i) => (i === null ? 0 : (i + 1) % photos.length))}
        />
      )}
    </section>
  );
}
