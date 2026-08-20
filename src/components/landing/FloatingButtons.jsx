import { MessageCircle, Phone, Send } from "lucide-react";

function FloatingButtons() {
  return (
    <div className="fixed bottom-4 right-4 z-30 grid gap-2 sm:bottom-5 sm:right-5 sm:gap-3">
      <a
        className="grid size-11 place-items-center rounded-full bg-rose-500 text-white shadow-lg shadow-rose-200/80 sm:size-12"
        href="https://zalo.me/0335652868"
        aria-label="Zalo"
        target="_blank"
        rel="noreferrer"
      >
        <MessageCircle size={21} />
      </a>
      <a
        className="grid size-11 place-items-center rounded-full bg-pink-400 text-white shadow-lg shadow-pink-200/70 sm:size-12"
        href="tel:0335652868"
        aria-label="Gọi điện"
      >
        <Phone size={21} />
      </a>
     
    </div>
  );
}

export default FloatingButtons;
