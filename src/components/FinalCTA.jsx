import { MessageCircle } from "lucide-react";
import { pillButton } from "../constants/styles.js";

function FinalCTA() {
  return (
    <section className="m-4 grid gap-5 overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_85%_20%,rgba(255,255,255,0.22),transparent_24%),linear-gradient(135deg,#E54153,#c92538)] p-5 text-white shadow-[0_22px_70px_rgba(229,65,83,0.22)] sm:m-6 sm:p-7 lg:m-16 lg:flex lg:items-center lg:justify-between lg:p-10">
      <div>
        <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl lg:text-4xl">
          Bạn đã sẵn sàng cho ngày cưới?
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85 sm:mt-3">
          Đặt ngay hôm nay để nhận tư vấn miễn phí và xem bản demo phù hợp với phong cách của bạn.
        </p>
      </div>
      <div className="grid gap-2 min-[420px]:grid-cols-2 lg:flex lg:flex-wrap lg:gap-3">
        <a className={`${pillButton} w-full bg-white text-rose-600 lg:w-auto`} href="https://zalo.me/0335652868" target="_blank" rel="noreferrer">
          <MessageCircle size={19} /> Đặt ngay hôm nay
        </a>
        <a className={`${pillButton} w-full bg-white/15 text-white hover:bg-white/20 lg:w-auto`} href="#order">
          Nhận tư vấn miễn phí
        </a>
      </div>
    </section>
  );
}

export default FinalCTA;
