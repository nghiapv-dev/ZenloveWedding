import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { heroWeddingSlides } from "../../data/siteData.jsx";

const heroTemplates = heroWeddingSlides;

function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setActiveSlide((current) => (current + 1) % heroTemplates.length),
      3000,
    );
    return () => window.clearInterval(timer);
  }, []);

  const templateAt = (offset) => heroTemplates[(activeSlide + offset) % heroTemplates.length];
  const frontTemplate = templateAt(0);

  return (
    <section className="hero-redesign">
      <div className="hero-redesign__inner">
        <div className="hero-redesign__copy">
          <p className="hero-redesign__eyebrow">
            ZenLove Wedding lo trọn gói từ lúc nhận thông tin đến lúc bạn duyệt xong thiệp
          </p>

          <h1 className="hero-redesign__title">
            Dịch Vụ Tạo Thiệp<br />
            Cưới Online <span>Trọn Gói</span>
          </h1>

          <p className="hero-redesign__description">
            Gửi thông tin, ZenLove Wedding lo hết. Không cần biết thiết kế — nhận thiệp đẹp
            trong 1–2 tiếng, chỉ từ 119.000đ.
          </p>

          <div className="hero-redesign__benefits">
            <span>Từ 119k</span>
            <span>Giao 1–2 tiếng</span>
            <span>Chỉnh sửa không giới hạn</span>
          </div>

          <div className="hero-redesign__actions">
            <a className="hero-redesign__primary" href="#pricing">
              Xem bảng giá và đặt dịch vụ
            </a>
          </div>
        </div>

        <div className="hero-deck" aria-label="Các mẫu thiệp cưới ZenLove nổi bật">
          <div className="hero-deck__card hero-deck__card--left">
            <img src={templateAt(2).image} alt="Mẫu thiệp ZenLove" />
          </div>
          <div className="hero-deck__card hero-deck__card--right">
            <img src={templateAt(1).image} alt="Mẫu thiệp ZenLove" />
          </div>
          <div className="hero-deck__card hero-deck__card--front">
            <img key={frontTemplate.image} src={frontTemplate.image} alt={frontTemplate.title} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
