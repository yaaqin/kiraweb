"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, use, useState } from "react";
import {
  FaBagShopping,
  FaBuildingColumns,
  FaCreditCard,
  FaEnvelope,
  FaHouse,
  FaImages,
  FaInstagram,
  FaLocationDot,
  FaMagnifyingGlass,
  FaMoneyBillWave,
  FaPhone,
  FaQrcode,
  FaRegClock,
  FaScissors,
  FaStore,
  FaTiktok,
  FaWallet,
  FaWhatsapp,
  FaXmark,
} from "react-icons/fa6";
import { BRAND, whatsappLink } from "@/lib/config";
import { CATEGORIES, rupiah } from "@/lib/format";
import type { CatalogItem, Category } from "@/lib/types";

const SERVICE_CATEGORIES = CATEGORIES.filter((c) => c.value !== "RETAIL");

const NAV = [
  { href: "#beranda", label: "Beranda", icon: FaHouse },
  { href: "#layanan", label: "Layanan", icon: FaScissors },
  { href: "#shop", label: "Shop", icon: FaStore },
  { href: "#gallery", label: "Gallery", icon: FaImages },
  { href: "#contact", label: "Contact", icon: FaEnvelope },
];

const unsplash = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const GALLERY = [
  { id: "photo-1560066984-138dadb4c035", alt: "Suasana salon" },
  { id: "photo-1522337360788-8b13dee7a37e", alt: "Hair coloring" },
  { id: "photo-1516975080664-ed2fc6a32937", alt: "Creambath" },
  { id: "photo-1527799820374-dcf8d9d4a388", alt: "Hair styling" },
];

const PAYMENT_OPTIONS = [
  { value: "QRIS (GoPay/OVO/ShopeePay/DANA)", label: "QRIS Cashless" },
  { value: "Transfer Bank BCA", label: "Transfer BCA" },
  { value: "Transfer Bank Mandiri", label: "Transfer Mandiri" },
  { value: "Bayar Tunai di Kasir", label: "Bayar Tunai di Salon" },
];

interface CartLine {
  id: number;
  name: string;
  price: number;
  qty: number;
}

export function Landing({ catalog }: { catalog: Promise<CatalogItem[]> }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [waOpen, setWaOpen] = useState(false);
  const [query, setQuery] = useState("");

  const cartQty = cart.reduce((s, l) => s + l.qty, 0);

  function addToCart(item: CatalogItem) {
    setCart((prev) => {
      const found = prev.find((l) => l.id === item.id);
      if (found) return prev.map((l) => (l.id === item.id ? { ...l, qty: l.qty + 1 } : l));
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  }

  function changeQty(id: number, delta: number) {
    setCart((prev) =>
      prev.map((l) => (l.id === id ? { ...l, qty: l.qty + delta } : l)).filter((l) => l.qty > 0),
    );
  }

  return (
    <div className="relative min-h-screen bg-blush-50 pb-16 md:pb-0">
      <div className="flex items-center justify-between border-b border-blush-200 bg-blush-100/90 px-4 py-1 text-[10px] font-medium text-charcoal-900 sm:text-xs">
        <span className="truncate pr-2">
          <FaLocationDot className="mr-1 inline text-blush-400" /> {BRAND.address}
        </span>
        <a href={`tel:${BRAND.phone}`} className="shrink-0 font-bold text-blush-500">
          <FaPhone className="mr-1 inline" /> {BRAND.phone}
        </a>
      </div>

      <header className="sticky top-0 z-40 border-b border-blush-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
          <a href="#beranda" className="flex shrink-0 flex-col">
            <span className="font-serif text-lg font-bold tracking-wider text-charcoal-900 md:text-xl">{BRAND.name}</span>
            <span className="-mt-1 text-[8px] font-bold uppercase tracking-[0.2em] text-blush-400">{BRAND.tagline}</span>
          </a>

          <nav className="hidden items-center gap-1 text-xs font-bold uppercase tracking-wider text-charcoal-900/70 md:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="rounded-full px-3 py-1 hover:bg-blush-50 hover:text-blush-500">
                {n.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="relative flex w-full max-w-[200px] items-center">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari menu..."
                className="w-full rounded-full border border-blush-200 bg-blush-50 py-1.5 pl-7 pr-3 text-[11px] focus:border-blush-400 focus:outline-none"
              />
              <FaMagnifyingGlass className="absolute left-2.5 text-[10px] text-blush-400" />
            </div>
            <button
              onClick={() => setCartOpen(true)}
              aria-label="Keranjang"
              className="relative shrink-0 rounded-full border border-blush-200 bg-blush-50 p-2"
            >
              <FaBagShopping className="text-sm text-blush-400" />
              {cartQty > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blush-400 text-[9px] font-bold text-white">
                  {cartQty}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2 text-[11px] font-bold uppercase tracking-wider text-charcoal-900/70 md:hidden">
          {[...NAV.slice(0, 4), { href: "#payment", label: "Pembayaran" }, NAV[4]].map((n) => (
            <a key={n.href} href={n.href} className="shrink-0 rounded-full px-3 py-1 hover:bg-blush-50">
              {n.label}
            </a>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-4 md:py-8">
        <section id="beranda" className="scroll-mt-32">
          <div className="relative overflow-hidden rounded-2xl border border-blush-200 shadow-md md:rounded-3xl">
            <Image
              src={unsplash("photo-1562322140-8baeececf3df", 1400)}
              alt={`Interior ${BRAND.name}`}
              width={1400}
              height={600}
              priority
              className="h-56 w-full object-cover sm:h-72 md:h-[420px]"
            />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-charcoal-900/80 via-charcoal-900/30 to-transparent p-5 text-white md:p-10">
              <span className="mb-1 w-max rounded-full bg-white/20 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-blush-200 backdrop-blur-md">
                Aesthetic Blush Pink
              </span>
              <h1 className="font-serif text-2xl font-bold leading-tight md:text-5xl">Elevate Your Hair Beauty</h1>
              <p className="mt-1 max-w-lg text-[11px] text-white/80 md:text-sm">
                Potongan presisi, pewarnaan trendi & perawatan intensif di Tangerang.
              </p>
              <div className="mt-3 flex gap-2 md:mt-5">
                <a
                  href={whatsappLink(`Halo ${BRAND.name}, saya ingin booking jadwal`)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-blush flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider md:px-6 md:py-2.5 md:text-xs"
                >
                  <FaWhatsapp className="text-xs" /> Booking WA
                </a>
                <a
                  href="#layanan"
                  className="rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-charcoal-900 md:px-6 md:py-2.5 md:text-xs"
                >
                  Pricelist
                </a>
              </div>
            </div>
          </div>
        </section>

        <Suspense fallback={<SectionSkeleton title="Menu Treatment" />}>
          <ServicesSection catalog={catalog} query={query} onAdd={addToCart} />
        </Suspense>

        <Suspense fallback={<SectionSkeleton title="Produk Perawatan" />}>
          <ProductsSection catalog={catalog} onAdd={addToCart} />
        </Suspense>

        <section id="gallery" className="scroll-mt-32">
          <SectionHeading eyebrow="Momen Salon" title="Galeri Kegiatan" />
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-4">
            {GALLERY.map((g) => (
              <div key={g.id} className="h-36 overflow-hidden rounded-xl border border-blush-200 md:h-56">
                <Image src={unsplash(g.id, 500)} alt={g.alt} width={500} height={400} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <section id="payment" className="scroll-mt-32 space-y-3 rounded-2xl border border-blush-200 bg-white p-4 md:p-6">
            <h3 className="flex items-center gap-2 font-serif text-sm font-bold text-charcoal-900 md:text-lg">
              <FaCreditCard className="text-blush-400" /> Metode Pembayaran
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-charcoal-900/80 md:text-xs">
              {[
                { icon: FaQrcode, label: "QRIS Cashless" },
                { icon: FaBuildingColumns, label: "BCA / Mandiri" },
                { icon: FaWallet, label: "ShopeePay / OVO" },
                { icon: FaMoneyBillWave, label: "Tunai (Cash)" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 rounded-xl bg-blush-50 p-2">
                  <Icon className="text-blush-400" /> {label}
                </div>
              ))}
            </div>
          </section>

          <section id="contact" className="scroll-mt-32 space-y-3 rounded-2xl border border-blush-200 bg-white p-4 md:p-6">
            <h3 className="font-serif text-sm font-bold text-charcoal-900 md:text-lg">Hubungi {BRAND.name}</h3>
            <div className="space-y-2 text-[11px] text-charcoal-900/80 md:text-xs">
              <p className="flex items-start gap-2">
                <FaLocationDot className="mt-0.5 text-blush-400" /> {BRAND.address}
              </p>
              <p className="flex items-center gap-2">
                <FaPhone className="text-blush-400" /> {BRAND.phone}
              </p>
              <div className="flex items-center gap-3 pt-1">
                <a href={BRAND.instagram.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-bold text-blush-500">
                  <FaInstagram /> {BRAND.instagram.handle}
                </a>
                <a href={BRAND.tiktok.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-bold text-blush-500">
                  <FaTiktok /> {BRAND.tiktok.handle}
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="mx-auto flex max-w-6xl items-center justify-between px-4 pb-6 text-[10px] text-charcoal-900/50">
        <span>© {BRAND.name}</span>
        <Link href="/login" className="font-bold hover:text-blush-500">
          Admin Login
        </Link>
      </footer>

      {/* Floating WhatsApp */}
      <div className="fixed bottom-20 right-4 z-40 md:bottom-6">
        <button
          onClick={() => setWaOpen((o) => !o)}
          aria-label="Chat WhatsApp"
          className="btn-blush relative flex h-12 w-12 items-center justify-center rounded-full shadow-lg"
        >
          <FaWhatsapp className="text-2xl" />
          <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
        </button>
      </div>

      {waOpen && (
        <div className="fixed bottom-36 right-4 z-50 w-72 overflow-hidden rounded-2xl border border-blush-300 bg-white shadow-2xl md:bottom-20">
          <div className="flex items-center justify-between bg-blush-400 p-3 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 font-serif text-xs font-bold">SoM</div>
              <div>
                <p className="font-serif text-xs font-bold">{BRAND.name} Assistant</p>
                <p className="text-[9px] text-white/80">Online | {BRAND.phone}</p>
              </div>
            </div>
            <button onClick={() => setWaOpen(false)} aria-label="Tutup" className="text-white/80">
              <FaXmark className="text-sm" />
            </button>
          </div>
          <div className="bg-blush-50 p-3 text-[11px] text-charcoal-900">
            <p className="rounded-xl border border-blush-200 bg-white p-2.5">
              Halo! Selamat datang di {BRAND.name}. Ada yang bisa kami bantu seputar treatment atau booking hari ini?
            </p>
          </div>
          <div className="space-y-1.5 border-t border-blush-200 bg-white p-2 text-[10px]">
            {[
              { emoji: "💡", label: "Booking Jadwal Salon Hari Ini", msg: "saya ingin booking jadwal salon hari ini" },
              { emoji: "✂️", label: "Konsultasi Model Rambut", msg: "saya mau konsultasi model & warna rambut" },
            ].map((o) => (
              <a
                key={o.label}
                href={whatsappLink(`Halo ${BRAND.name}, ${o.msg}`)}
                target="_blank"
                rel="noreferrer"
                className="block w-full rounded-lg bg-blush-50 p-2 text-left font-medium hover:bg-blush-100"
              >
                {o.emoji} {o.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-blush-200 bg-white px-4 py-2 text-[10px] font-bold text-charcoal-900/70 md:hidden">
        {NAV.map(({ href, label, icon: Icon }) => (
          <a key={href} href={href} className="flex flex-col items-center hover:text-blush-500">
            <Icon className="mb-0.5 text-sm" />
            <span>{label}</span>
          </a>
        ))}
      </nav>

      <CartSheet open={cartOpen} cart={cart} onClose={() => setCartOpen(false)} onChangeQty={changeQty} />
    </div>
  );
}

function SectionHeading({ eyebrow, title, aside }: { eyebrow: string; title: string; aside?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between md:mb-5">
      <div>
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-blush-400 md:text-[11px]">{eyebrow}</span>
        <h2 className="font-serif text-xl font-bold text-charcoal-900 md:text-3xl">{title}</h2>
      </div>
      {aside}
    </div>
  );
}

function SectionSkeleton({ title }: { title: string }) {
  return (
    <section>
      <SectionHeading eyebrow="Memuat..." title={title} />
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl border border-blush-200 bg-white" />
        ))}
      </div>
    </section>
  );
}

function ServicesSection({
  catalog,
  query,
  onAdd,
}: {
  catalog: Promise<CatalogItem[]>;
  query: string;
  onAdd: (item: CatalogItem) => void;
}) {
  const items = use(catalog).filter((i) => i.category !== "RETAIL");
  const [category, setCategory] = useState<Category>("HAIRCUT");
  const q = query.trim().toLowerCase();
  const visible = q
    ? items.filter((i) => i.name.toLowerCase().includes(q))
    : items.filter((i) => i.category === category);

  return (
    <section id="layanan" className="scroll-mt-32">
      <SectionHeading
        eyebrow="Pricelist Lengkap"
        title="Menu Treatment"
        aside={
          <span className="text-[10px] font-medium text-charcoal-900/60">
            <FaRegClock className="mr-1 inline text-blush-400" /> Estimasi Waktu
          </span>
        }
      />

      {!q && (
        <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto">
          {SERVICE_CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase ${
                category === c.value
                  ? "bg-blush-400 text-white shadow-sm"
                  : "border border-blush-200 bg-white text-charcoal-900"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-2xl border border-blush-200 bg-white p-3">
            <div>
              {item.duration && (
                <span className="rounded-full bg-blush-50 px-2 py-0.5 text-[8px] font-bold text-blush-400">
                  <FaRegClock className="mr-0.5 inline" /> {item.duration}
                </span>
              )}
              <h4 className="mt-1 font-serif text-xs font-bold text-charcoal-900 md:text-sm">{item.name}</h4>
              <p className="mt-0.5 text-xs font-bold text-blush-500">{rupiah(item.price)}</p>
            </div>
            <button onClick={() => onAdd(item)} className="btn-blush rounded-xl px-3 py-1.5 text-[10px] font-bold">
              + Tambah
            </button>
          </div>
        ))}
        {visible.length === 0 && (
          <p className="col-span-full py-6 text-center text-xs text-charcoal-900/50">Menu tidak ditemukan.</p>
        )}
      </div>
    </section>
  );
}

function ProductsSection({ catalog, onAdd }: { catalog: Promise<CatalogItem[]>; onAdd: (item: CatalogItem) => void }) {
  const products = use(catalog).filter((i) => i.category === "RETAIL");
  if (products.length === 0) return null;

  return (
    <section id="shop" className="scroll-mt-32">
      <SectionHeading eyebrow="Homecare Retail" title="Produk Perawatan" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {products.map((p) => (
          <div key={p.id} className="flex flex-col justify-between overflow-hidden rounded-2xl border border-blush-200 bg-white p-2.5">
            {p.imageUrl ? (
              <Image
                src={p.imageUrl}
                alt={p.name}
                width={300}
                height={200}
                unoptimized
                className="mb-2 h-24 w-full rounded-xl object-cover md:h-36"
              />
            ) : (
              <div className="mb-2 flex h-24 w-full items-center justify-center rounded-xl bg-blush-100 text-blush-300 md:h-36">
                <FaStore className="text-2xl" />
              </div>
            )}
            <div>
              <h5 className="line-clamp-1 font-serif text-xs font-bold text-charcoal-900">{p.name}</h5>
              <p className="mt-0.5 text-xs font-bold text-blush-500">{rupiah(p.price)}</p>
            </div>
            <button
              onClick={() => onAdd(p)}
              className="mt-2 w-full rounded-xl border border-blush-200 bg-blush-50 py-1.5 text-[10px] font-bold text-charcoal-900 hover:bg-blush-100"
            >
              + Keranjang
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function CartSheet({
  open,
  cart,
  onClose,
  onChangeQty,
}: {
  open: boolean;
  cart: CartLine[];
  onClose: () => void;
  onChangeQty: (id: number, delta: number) => void;
}) {
  const [payment, setPayment] = useState(PAYMENT_OPTIONS[0].value);
  const total = cart.reduce((s, l) => s + l.price * l.qty, 0);

  function checkout() {
    if (!cart.length) return;
    const lines = cart.map((l) => `- ${l.name} (${l.qty}x)`).join("\n");
    const msg = `Halo ${BRAND.name}, saya mau checkout order:\n\n${lines}\n\n*Total:* ${rupiah(total)}\n*Metode:* ${payment}`;
    window.open(whatsappLink(msg), "_blank");
  }

  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-50 flex flex-col justify-end bg-charcoal-900/60 transition-opacity md:items-end md:justify-start ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex max-h-[85%] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl transition-transform duration-300 md:h-full md:max-h-none md:w-96 md:rounded-none ${
          open ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-x-full md:translate-y-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-blush-200 bg-blush-50 p-4">
          <h4 className="flex items-center gap-2 font-serif text-sm font-bold text-charcoal-900">
            <FaBagShopping className="text-blush-400" /> Keranjang Belanja
          </h4>
          <button onClick={onClose} aria-label="Tutup" className="p-1 text-charcoal-900/60">
            <FaXmark className="text-base" />
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <p className="py-8 text-center text-xs text-charcoal-900/50">Keranjang belanja kosong.</p>
          ) : (
            cart.map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-xl border border-blush-200 bg-blush-50 p-2.5 text-xs">
                <div>
                  <p className="font-serif font-bold text-charcoal-900">{l.name}</p>
                  <p className="text-[11px] font-bold text-blush-500">{rupiah(l.price * l.qty)}</p>
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-blush-200 bg-white px-2 py-0.5">
                  <button onClick={() => onChangeQty(l.id, -1)} className="h-4 w-4 text-xs font-bold">
                    -
                  </button>
                  <span className="w-4 text-center text-[11px] font-bold">{l.qty}</span>
                  <button onClick={() => onChangeQty(l.id, 1)} className="h-4 w-4 text-xs font-bold">
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-3 border-t border-blush-200 bg-blush-50 p-4">
          <div className="flex items-center justify-between text-xs font-bold text-charcoal-900">
            <span>Total Harga:</span>
            <span className="font-serif text-base text-blush-500">{rupiah(total)}</span>
          </div>
          <label className="block">
            <span className="mb-1 block text-[10px] font-bold text-charcoal-900/80">Metode Pembayaran</span>
            <select
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
              className="w-full rounded-xl border border-blush-200 bg-white p-2 text-xs focus:outline-none"
            >
              {PAYMENT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={checkout}
            disabled={!cart.length}
            className="btn-blush flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider"
          >
            <FaWhatsapp className="text-sm" /> Checkout via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
