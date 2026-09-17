import { useState } from "react";
import { formatImageUrl } from "@/lib/utils";

export function AccountGallery({ images, isRoyale = false }: { images: string[]; isRoyale?: boolean }) {
  const [activeImage, setActiveImage] = useState(images[0] || "");

  if (!images || images.length === 0) {
    return <div className={`w-full ${isRoyale ? "aspect-[3/4]" : "aspect-video"} bg-muted rounded-lg flex items-center justify-center text-muted-foreground`}>لا توجد صور</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={`relative w-full ${isRoyale ? "aspect-[3/4] max-h-[580px] mx-auto bg-slate-950" : "aspect-video bg-muted"} rounded-lg overflow-hidden border border-border`}>
        {isRoyale && activeImage && (
          <img
            aria-hidden="true"
            src={formatImageUrl(activeImage)}
            alt=""
            className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-30 pointer-events-none"
          />
        )}
        <img src={formatImageUrl(activeImage)} alt="صورة الحساب" className="relative w-full h-full object-contain" loading="lazy" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, i) => (
            <button 
              key={i} 
              onClick={() => setActiveImage(img)}
              className={`flex-shrink-0 ${isRoyale ? "w-16 aspect-[3/4]" : "w-24 aspect-video"} rounded-md overflow-hidden border-2 transition-all ${activeImage === img ? 'border-primary opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
            >
              <img src={formatImageUrl(img)} alt={`صورة مصغرة ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
