export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9998";

export const BRAND = {
  name: "Style on Motion",
  tagline: "Luxury Hair Salon",
  address: "Ruko Gravitas No.1, Suvarna Sutera - Cikupa Tangerang",
  phone: "081112001502",
  whatsapp: "6281112001502",
  instagram: { handle: "@sohatelier.salon", url: "https://instagram.com" },
  tiktok: { handle: "@sohatelier", url: "https://tiktok.com" },
  banks: [
    { bank: "BCA", number: "8830192011", display: "8830-1920-11" },
    { bank: "Mandiri", number: "1370001299", display: "1370-0012-99" },
  ],
  accountHolder: "Salon Style on Motion Tangerang",
};

export const whatsappLink = (message: string) =>
  `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(message)}`;
