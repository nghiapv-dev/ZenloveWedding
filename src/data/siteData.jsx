import {
  CalendarHeart,
  Clock3,
  Crown,
  Heart,
  MessageCircle,
  Music,
  Palette,
  Phone,
  ShieldCheck,
  Sparkles,
  Video,
} from "lucide-react";

export const services = [
  {
    title: "Thiệp cưới Online",
    price: "119K",
    cta: "Xem mẫu",
    icon: CalendarHeart,
  },
  {
    title: "Album Nhạc",
    price: "99K",
    cta: "Xem mẫu",
    icon: Music,
  },
  {
    title: "Slide cưới",
    price: "150K",
    cta: "Xem mẫu",
    icon: Video,
  },
  {
    title: "Background màn sao băng",
    price: "59K",
    cta: "Xem mẫu",
    icon: Sparkles,
  },
  {
    title: "Thiết kế theo yêu cầu",
    price: "300K",
    cta: "Tư vấn",
    icon: Palette,
  },
  {
    title: "Combo Premium",
    price: "399K",
    cta: "Xem chi tiết",
    icon: Crown,
    featured: true,
  },
];

export const heroWeddingSlides = [
  { image: "/wedding-templates/Hinh1.webp" },
  { image: "/wedding-templates/Hinh2.webp" },
  { image: "/wedding-templates/Hinh3.webp" },
];

export const serviceDemoSections = {
  wedding: {
    eyebrow: "Kho mẫu thiệp",
    title: "Thiệp cưới Online",
    subtitle: "",
    groups: [{ title: "Thiệp cưới ZenLove", items: [] }],
  },
  album: {
    eyebrow: "Kho album nhạc",
    title: "Album Nhạc",
    subtitle: "Xem ảnh mẫu album nhạc cưới",
    groups: [
      {
        title: "Album nhạc",
        items: [
          { title: "Mẫu 1", image: "/wedding-music/album-1.webp" },
          { title: "Mẫu 2", image: "/wedding-music/album-2.webp" },
          { title: "Mẫu 3", image: "/wedding-music/album-3.webp" },
          { title: "Mẫu 4", image: "/wedding-music/album-4.webp" },
          { title: "Mẫu 5", image: "/wedding-music/album-5.webp" },
          { title: "Mẫu 6", image: "/wedding-music/album-6.webp" },
        ],
      },
    ],
  },
  video: {
    eyebrow: "Kho slide cưới",
    title: "Slide cưới",
    subtitle: "Xem mẫu slide cưới. Bấm Xem mẫu để mở bản mẫu tương ứng.",
    variant: "slide",
    ctaLabel: "Xem mẫu",
    groups: [
      {
        title: "Slide cưới",
        items: [],
      },
    ],
  },
  background: {
    title: "Background màn sao băng",
    subtitle: "Bấm Xem mẫu để mở bản mẫu tương ứng.",
    variant: "landscape",
    ctaLabel: "Xem mẫu",
    groups: [
      {
        title: "Background màn sao băng",
        items: [],
      },
    ],
  },
};

export const packages = [
  {
  name: "Combo Slide & Thiệp",
  price: "250K",
  fit: "Được thiết kế cho cặp đôi muốn sở hữu thiệp cưới online và video slide cưới với mức chi phí tiết kiệm.",
  features: [
    "01 Thiệp cưới Online",
    "01 Video Slide cưới",
    "Tiết kiệm hơn khi mua lẻ"
  ],
},
  {
    name: "Premium",
    price: "399K",
    fit: "Phù hợp khách muốn đủ thiệp, album, slide và hiệu ứng nổi bật.",
    features: [
      "Thiệp online cao cấp",
      "Album nhạc cưới",
      "Slide cưới",
      "Background màn sao băng",
      "không giới hạn chỉnh sửa",
    ],
    popular: true,
  },
  {
  name: "Combo",
  price: "299K",
  fit: "Chọn 1 trong 2 gói dịch vụ tiết kiệm.",
  features: [
    "Combo 1: Thiệp Online + Màn sao băng + Slide cưới",
    "Combo 2: Slide cưới + Màn sao băng + Album nhạc cưới"
  ],
},
{
  name: "Combo Tiết Kiệm",
  price: "199K",
  fit: "Phù hợp cho cặp đôi muốn có video trình chiếu nổi bật với chi phí hợp lý.",
  features: [
    "Slide cưới",
    "Màn sao băng"
  ],
},
{
  name: "Slide Cưới Custom",
  price: "Từ 300K",
  fit: "Được thiết kế cho cặp đôi muốn sở hữu video slide cưới được thiết kế độc quyền theo phong cách riêng.",
  features: [
    "Không giới hạn số lượng ảnh",
    "Thiết kế riêng theo yêu cầu",
    "Tự chọn nhạc nền yêu thích",
    "Độ dài video không giới hạn"
  ],
}
];

export const whyItems = [
  ["Thiết kế độc quyền", Palette],
  ["Giao nhanh từ 2-4h", Clock3],
  ["Hỗ trợ tận tay", MessageCircle],
  ["Chỉnh sửa miễn phí", Heart],
  ["Xem trên mọi thiết bị", Phone],
  ["Bảo mật thông tin", ShieldCheck],
];

export const feedbacks = [
  { title: "Feedback 1", source: "Zalo", image: "/feedback/zalo-1.webp" },
  { title: "Feedback 2", source: "Zalo", image: "/feedback/zalo-2.webp" },
  { title: "Feedback 3", source: "Zalo", image: "/feedback/zalo-3.webp" },
  { title: "Feedback 4", source: "Zalo", image: "/feedback/zalo-4.webp" },
  { title: "Feedback 5", source: "Zalo", image: "/feedback/zalo-5.webp" },
  { title: "Feedback 6", source: "Zalo", image: "/feedback/zalo-6.webp" },
  { title: "Feedback 7", source: "Zalo", image: "/feedback/zalo-7.webp" },
  { title: "Feedback 8", source: "Zalo", image: "/feedback/zalo-8.webp" },
  { title: "Feedback 9", source: "Zalo", image: "/feedback/zalo-9.webp" },
  { title: "Feedback 10", source: "Zalo", image: "/feedback/zalo-10.webp" },
];

export const faqs = [
  [
    "Bao lâu để hoàn thành thiệp?",
    "Thường thường là bản demo trong 24h sau khi nhận đủ nội dung và ảnh.",
  ],
  [
    "Có sửa không?",
    "Có. Mỗi gói đều có số lần chỉnh sửa, gói Premium hỗ trợ chỉnh nhiều hơn."
  ],
  [
    "Có làm gấp không?",
    "Có thể làm gấp tức thời. Bạn nên nhắn Zalo để kiểm tra lịch trước.",
  ],
  [
    "Thanh toán sao?",
    "Có thể cọc trước, kiểm tra demo rồi thanh toán phần còn lại khi bản giao.",
  ],
];

export const processSteps = [
  "Liên hệ",
  "Chọn mẫu",
  "Gửi ảnh",
  "Thiết kế",
  "Chỉnh sửa",
  "Nhận sản phẩm",
  "Thanh toán",
];
