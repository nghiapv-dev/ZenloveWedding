import { useEffect } from "react";
import { X } from "lucide-react";

function ImageModal({ image, onClose }) {
  useEffect(() => {
    if (!image) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative max-h-[92vh] w-full max-w-4xl"
        onClick={(event) => event.stopPropagation()}
        role="presentation"
      >
        <button
          className="absolute -right-2 -top-2 z-10 grid size-10 place-items-center rounded-full bg-white text-slate-950 shadow-lg transition hover:bg-rose-50 hover:text-rose-500"
          onClick={onClose}
          type="button"
          aria-label="Đóng ảnh"
        >
          <X size={20} />
        </button>

        <img
          className="mx-auto max-h-[92vh] w-auto max-w-full rounded-2xl bg-white object-contain shadow-2xl"
          src={image.src}
          alt={image.alt}
          decoding="async"
        />
      </div>
    </div>
  );
}

export default ImageModal;
