import { useState } from "react";
import { formatImageUrl } from "@/lib/utils";

export function AccountGallery({ images }: { images: string[] }) {
  const [activeImage, setActiveImage] = useState(images[0] || "");

  if (!images || images.length === 0) {
    return <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">لا توجد صور</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full aspect-video rounded-lg overflow-hidden border border-border bg-muted">
        <img src={formatImageUrl(activeImage)} alt="صورة الحساب" className="w-full h-full object-contain" loading="lazy" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, i) => (
            <button 
              key={i} 
              onClick={() => setActiveImage(img)}
              className={`flex-shrink-0 w-24 aspect-video rounded-md overflow-hidden border-2 transition-all ${activeImage === img ? 'border-primary opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
            >
              <img src={formatImageUrl(img)} alt={`صورة مصغرة ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
