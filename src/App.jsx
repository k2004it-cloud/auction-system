import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import { isSupabaseConfigured, supabase } from "./lib/supabaseClient";
import {
  Activity,
  ArrowLeft,
  BadgeCheck,
  Bell,
  Bot,
  BriefcaseBusiness,
  Building2,
  Camera,
  Car,
  CheckCircle2,
  ChevronRight,
  Chrome,
  ClipboardCheck,
  CreditCard,
  Crown,
  Eye,
  EyeOff,
  Filter,
  Gavel,
  Github,
  Heart,
  Home,
  ImagePlus,
  KeyRound,
  Loader2,
  LogOut,
  LockKeyhole,
  Mail,
  Menu,
  MessageCircle,
  Moon,
  PackageCheck,
  Phone,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Timer,
  TrendingUp,
  User,
  UserPlus,
  UsersRound,
  Wallet,
  X,
  XCircle,
  Zap
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const initialAuctions = [
  {
    id: "AU-901",
    title: "Tesla Model X Performance",
    category: "Vehicles",
    seller: "Elite Motors",
    bid: 8240000,
    reserve: 9000000,
    bids: 148,
    watchers: 394,
    progress: 78,
    time: "02h 14m",
    location: "Nairobi",
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=900&q=80",
    accent: "from-blue-premium/40 to-green-success/20",
    specs: ["2023 model", "Performance trim", "Verified logbook", "Battery health report"],
    inspection: "Vehicle has passed identity, logbook, and condition checks.",
    payment: "10% deposit hold, balance via bank transfer or verified M-Pesa split payment.",
    status: "approved",
    cameraAvailable: true,
    approvalNote: "Approved after ownership and condition checks."
  },
  {
    id: "AU-778",
    title: "Rolex Submariner Date",
    category: "Luxury",
    seller: "Crown Vault",
    bid: 1850000,
    reserve: 2100000,
    bids: 96,
    watchers: 211,
    progress: 64,
    time: "05h 31m",
    location: "Westlands",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80",
    accent: "from-gold/35 to-orange-cta/20",
    specs: ["Authenticated serial", "Box and papers", "Escrow eligible", "Insured courier"],
    inspection: "Authentication documents and condition photographs reviewed by admin.",
    payment: "Wallet hold accepted. Escrow release after buyer confirmation.",
    status: "approved",
    cameraAvailable: true,
    approvalNote: "Serial, papers, and photo evidence verified."
  },
  {
    id: "AU-602",
    title: "MacBook Pro Studio Kit",
    category: "Electronics",
    seller: "Nairobi Tech Hub",
    bid: 342000,
    reserve: 390000,
    bids: 72,
    watchers: 168,
    progress: 52,
    time: "11h 08m",
    location: "Kilimani",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
    accent: "from-blue-premium/35 to-gold/15",
    specs: ["M3 Max", "64GB RAM", "Studio display", "Warranty valid"],
    inspection: "Serial number, battery cycle count, and warranty status verified.",
    payment: "M-Pesa STK push, card, and wallet balance supported.",
    status: "approved",
    cameraAvailable: true,
    approvalNote: "Device serial and warranty reviewed."
  },
  {
    id: "AU-411",
    title: "Oceanfront Property Lot",
    category: "Property",
    seller: "Prime Estates",
    bid: 18400000,
    reserve: 22000000,
    bids: 41,
    watchers: 132,
    progress: 45,
    time: "1d 03h",
    location: "Diani",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
    accent: "from-green-success/30 to-blue-premium/20",
    specs: ["Beach access", "Title deed review", "0.8 acres", "Survey map attached"],
    inspection: "Ownership documents, survey details, and seller KYC are under admin review.",
    payment: "Deposit via escrow. Completion through advocate-managed settlement.",
    status: "approved",
    cameraAvailable: false,
    approvalNote: "Document review completed before listing."
  }
];

const initialPendingLots = [
  {
    id: "AU-1007",
    title: "Canon EOS R6 Creator Bundle",
    category: "Electronics",
    seller: "Auctioneer Jane",
    bid: 185000,
    reserve: 230000,
    bids: 0,
    watchers: 18,
    progress: 18,
    time: "Pending",
    location: "Nakuru",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
    accent: "from-green-success/30 to-gold/20",
    specs: ["Camera body", "24-105mm lens", "Receipt uploaded", "Condition photos attached"],
    inspection: "Waiting for admin approval of uploaded proof, photos, and reserve price.",
    payment: "Wallet hold and M-Pesa deposit supported after approval.",
    status: "pending",
    cameraAvailable: true,
    approvalNote: "Needs admin review before bidders can see it."
  },
  {
    id: "AU-1008",
    title: "Toyota Hilux Workmate",
    category: "Vehicles",
    seller: "Rift Valley Auctioneers",
    bid: 2650000,
    reserve: 3100000,
    bids: 0,
    watchers: 27,
    progress: 22,
    time: "Pending",
    location: "Eldoret",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80",
    accent: "from-blue-premium/35 to-orange-cta/20",
    specs: ["Logbook uploaded", "Inspection report", "Mileage photos", "Seller KYC pending"],
    inspection: "Admin should confirm seller KYC, logbook ownership, and condition photos.",
    payment: "Deposit rules become active after approval.",
    status: "pending",
    cameraAvailable: false,
    approvalNote: "KYC and document review pending."
  }
];

const chartData = [
  { name: "Mon", bids: 120, revenue: 34 },
  { name: "Tue", bids: 210, revenue: 52 },
  { name: "Wed", bids: 180, revenue: 49 },
  { name: "Thu", bids: 310, revenue: 81 },
  { name: "Fri", bids: 420, revenue: 96 },
  { name: "Sat", bids: 390, revenue: 88 },
  { name: "Sun", bids: 510, revenue: 132 }
];

const activity = [
  ["New bid", "AU-901 increased by KES 120,000", "now"],
  ["Wallet funded", "M-Pesa STK push confirmed", "2m"],
  ["Auto-bid", "Proxy bid protected bidder K-448", "5m"],
  ["Fraud check", "Seller verification passed", "9m"]
];

const navItems = [
  { key: "dashboard", label: "My Bids", roles: ["auctionee"] },
  { key: "auctions", label: "Marketplace", roles: ["auctionee"] },
  { key: "vehicles", label: "Vehicles", roles: ["auctionee"] },
  { key: "property", label: "Property", roles: ["auctionee"] },
  { key: "wallet", label: "Wallet", roles: ["auctionee"] },
  { key: "dashboard", label: "Seller Desk", roles: ["auctioneer"] },
  { key: "sell", label: "Upload Lot", roles: ["auctioneer"] },
  { key: "seller-lots", label: "My Lots", roles: ["auctioneer"] },
  { key: "payouts", label: "Payouts", roles: ["auctioneer"] },
  { key: "admin", label: "Admin Control", roles: ["admin"] },
  { key: "notifications", label: "Risk Alerts", roles: ["admin"] },
  { key: "support", label: "AI Care", roles: ["auctionee", "auctioneer", "admin"] }
];

const formatKes = (value) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0
  }).format(value);

const loadStoredLots = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

function useSocketStatus() {
  const [status, setStatus] = useState("Mock realtime");

  useEffect(() => {
    const url = import.meta.env.VITE_SOCKET_URL;
    if (!url) return;
    const socket = io(url, { transports: ["websocket"], autoConnect: true });
    socket.on("connect", () => setStatus("Socket.IO live"));
    socket.on("disconnect", () => setStatus("Reconnecting"));
    socket.on("connect_error", () => setStatus("Backend offline"));
    return () => socket.disconnect();
  }, []);

  return status;
}

function useRoute() {
  const getRoute = () => window.location.hash.replace("#", "") || "home";
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(getRoute());
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return route;
}

function Navbar({ route, role }) {
  const [open, setOpen] = useState(false);
  const currentRole = normalizeRole(role);
  const visibleNavItems = navItems.filter((item) => item.roles.includes(currentRole));
  const homeRoute = getRoleHomeRoute(currentRole);
  const searchPlaceholder =
    currentRole === "admin"
      ? "Search approvals, users, lot IDs..."
      : currentRole === "auctioneer"
        ? "Search your lots, drafts, payouts..."
        : "Search auctions, sellers, lot IDs...";
  const openAiHub = () => {
    window.dispatchEvent(new Event("primebid-open-ai-hub"));
    setOpen(false);
  };
  const signOut = () => {
    clearAuthSession();
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-midnight/80 backdrop-blur-2xl">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <a href={`#${homeRoute}`} className="flex items-center gap-3">
          <img src="/images/prime-logo.png" alt="PrimeBid" className="h-10 site-logo" />
        </a>

        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {visibleNavItems.map(({ key, label }) => key === "support" ? (
            <button
              key={key}
              type="button"
              onClick={openAiHub}
              className="inline-flex items-center gap-2 rounded-2xl border-0 bg-transparent px-4 py-2 text-sm font-bold text-mist transition hover:bg-white/10 hover:text-white"
            >
              <Bot size={16} />
              {label}
            </button>
          ) : (
            <a
              key={key}
              href={`#${key}`}
              className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${route === key ? "bg-white/10 text-white" : "text-mist hover:bg-white/10 hover:text-white"}`}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="ml-auto hidden min-w-72 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-mist xl:flex">
          <Search size={18} />
          <input className="w-full bg-transparent text-sm outline-none placeholder:text-mist" placeholder={searchPlaceholder} />
        </div>

        <a href="#notifications" className="relative grid size-11 place-items-center rounded-2xl border border-white/10 bg-white/5 transition hover:bg-white/10" aria-label="Notifications">
          <Bell size={18} />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-orange-cta shadow-gold" />
        </a>

        <button className="grid size-11 place-items-center rounded-2xl border border-white/10 bg-white/5" aria-label="Toggle theme">
          <Moon size={18} />
        </button>

        <a href={`#${homeRoute}`} className="hidden min-h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 text-sm font-black text-snow sm:inline-flex">
          <User size={16} />
          {roleLabels[currentRole]}
        </a>

        <a href="#login" className="hidden rounded-2xl border border-gold/20 bg-gold/10 px-3 py-2 text-sm font-black text-gold transition hover:bg-gold hover:text-slate-950 md:inline-flex">
          Switch Role
        </a>

        <button type="button" onClick={signOut} className="hidden size-11 place-items-center rounded-2xl border border-white/10 bg-white/5 text-mist transition hover:text-white sm:grid" aria-label="Sign out">
          <LogOut size={18} />
        </button>

        <button className="grid size-11 place-items-center rounded-2xl border border-white/10 bg-white/5 lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-midnight/95 px-4 py-4 lg:hidden">
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-mist">
            <Search size={18} />
            <input className="w-full bg-transparent outline-none" placeholder={searchPlaceholder} />
          </div>
          <div className="grid gap-2">
            {visibleNavItems.map(({ key, label }) => key === "support" ? (
              <button
                key={key}
                type="button"
                onClick={openAiHub}
                className="inline-flex items-center gap-2 rounded-2xl border-0 bg-transparent px-4 py-3 text-left font-bold text-mist hover:bg-white/10 hover:text-white"
              >
                <Bot size={16} />
                {label}
              </button>
            ) : (
              <a key={key} href={`#${key}`} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 font-bold text-mist hover:bg-white/10 hover:text-white">
                {label}
              </a>
            ))}
            <a href="#login" onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 font-bold text-gold hover:bg-white/10">
              Switch Role
            </a>
            <button type="button" onClick={signOut} className="rounded-2xl px-4 py-3 text-left font-bold text-mist hover:bg-white/10 hover:text-white">
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs font-bold uppercase text-mist">{label}</div>
      <div className="mt-1 font-display text-lg font-black text-snow">{value}</div>
    </div>
  );
}

function PageHeader({ eyebrow, title, copy, action }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          {eyebrow && <div className="chip mb-4"><Sparkles size={15} /> {eyebrow}</div>}
          <h1 className="font-display text-4xl font-black leading-tight sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-mist">{copy}</p>
        </div>
        {action}
      </div>
    </section>
  );
}

const authModes = {
  login: {
    eyebrow: "Enterprise Access",
    title: "Welcome back to the auction floor.",
    copy: "Sign in to manage live bids, escrow-ready payments, watchlists, seller approvals, and executive auction intelligence."
  },
  register: {
    eyebrow: "Create Secure Access",
    title: "Join a premium auction network.",
    copy: "Open a verified account for auctionees, auctioneers, and admins with role-based access and fraud-aware workflows."
  },
  forgot: {
    eyebrow: "Credential Recovery",
    title: "Restore access without losing momentum.",
    copy: "Request a secure reset, verify the recovery code, and create a new password inside a protected flow."
  },
  otp: {
    eyebrow: "Verification Layer",
    title: "Confirm the code sent to your inbox.",
    copy: "Finish identity verification before entering high-value auctions, wallet funding, and admin workspaces."
  }
};

const authHighlights = [
  ["KES 42M", "daily auction volume"],
  ["99.8%", "realtime bid uptime"],
  ["24/7", "risk and wallet monitoring"]
];

const roleOptions = [
  ["auctionee", "Auctionee", User, "Bid on live lots, manage wallet holds, track wins, and save watchlists."],
  ["auctioneer", "Auctioneer", Gavel, "Submit goods, upload proof, watch approvals, and manage your auction lots."],
  ["admin", "Admin", ShieldCheck, "Review users, approve listings, moderate auctions, and monitor platform risk."]
];

const roleLabels = Object.fromEntries(roleOptions.map(([key, label]) => [key, label]));

const roleHomeRoutes = {
  auctionee: "dashboard",
  auctioneer: "dashboard",
  admin: "admin"
};

const authSessionKey = "primebid-authenticated";
const authChangedEvent = "primebid-auth-change";
const demoLoginPin = import.meta.env.VITE_DEMO_LOGIN_PIN || "1234";

function normalizeRole(role) {
  if (role === "buyer") return "auctionee";
  return roleHomeRoutes[role] ? role : "auctionee";
}

function persistRole(role) {
  const nextRole = normalizeRole(role);
  localStorage.setItem("primebid-auth-role", nextRole);
  window.dispatchEvent(new Event("primebid-role-change"));
  return nextRole;
}

function getStoredRole() {
  return normalizeRole(localStorage.getItem("primebid-auth-role"));
}

function persistAuthSession(role) {
  const nextRole = persistRole(role);
  localStorage.setItem(authSessionKey, "true");
  window.dispatchEvent(new Event(authChangedEvent));
  return nextRole;
}

function getAuthStatus() {
  return localStorage.getItem(authSessionKey) === "true";
}

function clearAuthSession() {
  localStorage.removeItem(authSessionKey);
  window.dispatchEvent(new Event(authChangedEvent));
  window.location.hash = "login";
}

function getRoleHomeRoute(role) {
  return roleHomeRoutes[normalizeRole(role)] || roleHomeRoutes.auctionee;
}

const routeAccess = {
  home: ["auctionee"],
  auctions: ["auctionee"],
  lot: ["auctionee"],
  vehicles: ["auctionee"],
  property: ["auctionee"],
  wallet: ["auctionee"],
  dashboard: ["auctionee", "auctioneer"],
  sell: ["auctioneer"],
  "seller-lots": ["auctioneer"],
  payouts: ["auctioneer"],
  admin: ["admin"],
  notifications: ["auctionee", "auctioneer", "admin"],
  support: ["auctionee", "auctioneer", "admin"]
};

function getRouteAccessKey(route) {
  if (/^lot-.+/.test(route)) return "lot";
  return route || "home";
}

function canAccessRoute(role, route) {
  const allowedRoles = routeAccess[getRouteAccessKey(route)];
  return Boolean(allowedRoles?.includes(normalizeRole(role)));
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const wait = (ms = 760) => new Promise((resolve) => window.setTimeout(resolve, ms));

function AuthToastStack({ items }) {
  return (
    <div className="fixed right-4 top-4 z-[120] grid w-[min(22rem,calc(100vw-2rem))] gap-3">
      {items.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.96 }}
          className={`rounded-2xl border p-4 text-sm font-bold shadow-glass backdrop-blur-xl ${item.type === "error" ? "border-red-400/30 bg-red-500/10 text-red-100" : "border-green-success/30 bg-green-success/10 text-green-100"}`}
        >
          {item.text}
        </motion.div>
      ))}
    </div>
  );
}

function AuthInput({ icon: Icon, label, error, action, className = "", ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-bold text-snow">{label}</span>
      <span className={`flex min-h-14 items-center gap-3 rounded-2xl border bg-white/[0.045] px-4 transition focus-within:border-gold/70 focus-within:bg-white/[0.07] focus-within:shadow-gold ${error ? "border-red-400/50" : "border-white/10"}`}>
        <Icon size={18} className={error ? "text-red-200" : "text-mist"} />
        <input
          {...props}
          className="min-w-0 flex-1 border-0 bg-transparent py-4 text-sm font-semibold text-snow outline-none placeholder:text-mist"
        />
        {action}
      </span>
      {error && <span className="mt-2 block text-xs font-bold text-red-200">{error}</span>}
    </label>
  );
}

function AuthButton({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="group relative mt-2 inline-flex min-h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-premium via-green-success to-gold px-5 font-black text-slate-950 shadow-glow transition duration-300 hover:-translate-y-0.5 hover:shadow-gold disabled:cursor-not-allowed disabled:opacity-75"
    >
      <span className="absolute inset-0 translate-x-[-110%] bg-white/35 transition duration-700 group-hover:translate-x-[110%]" />
      {loading ? <Loader2 size={20} className="relative animate-spin" /> : <Zap size={19} className="relative" />}
      <span className="relative">{children}</span>
    </button>
  );
}

function AuthBrandPanel({ mode }) {
  const copy = authModes[mode];

  return (
    <motion.aside
      initial={{ opacity: 0, x: -26 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7 }}
      className="relative isolate flex min-h-[32rem] overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-glass backdrop-blur-2xl lg:min-h-[calc(100vh-3rem)] lg:p-8"
    >
      <div className="absolute -left-24 top-20 size-72 rounded-full bg-blue-premium/35 blur-3xl" />
      <div className="absolute bottom-10 right-0 size-80 rounded-full bg-gold/20 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(16,185,129,0.18),transparent_26rem)]" />
      <img
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20 mix-blend-screen"
        src="https://images.unsplash.com/photo-1642052502780-8ee67e3ed5e2?auto=format&fit=crop&w=1300&q=80"
        alt="Premium auction authentication backdrop"
      />

      <div className="relative z-10 flex w-full flex-col justify-between gap-10">
        <div>
          <a href="#login" className="inline-flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-gold to-green-success text-slate-950 shadow-gold">
              <Gavel size={24} />
            </span>
            <span>
              <span className="block font-display text-2xl font-black">PrimeBid</span>
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-mist">Enterprise Auction OS</span>
            </span>
          </a>

          <div className="mt-12 max-w-2xl">
            <div className="chip mb-5 border-gold/20 bg-gold/10 text-gold"><Sparkles size={15} /> {copy.eyebrow}</div>
            <h1 className="font-display text-4xl font-black leading-[0.98] text-snow sm:text-5xl xl:text-6xl">{copy.title}</h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-mist sm:text-lg">{copy.copy}</p>
          </div>
        </div>

        <div className="grid gap-4">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="max-w-xl rounded-[1.7rem] border border-white/10 bg-midnight/70 p-4 shadow-glass backdrop-blur-2xl"
          >
            <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
              <img
                className="h-32 w-full rounded-2xl object-cover"
                src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=700&q=80"
                alt="Luxury watch auction preview"
              />
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="chip live-pulse bg-green-success/10">Live</span>
                  <span className="chip bg-blue-premium/15 text-snow">Escrow ready</span>
                </div>
                <h2 className="font-display text-xl font-black">Rolex Submariner Date</h2>
                <p className="mt-1 text-sm text-mist">Authenticated luxury lot with wallet holds and fraud monitoring.</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-blue-premium via-green-success to-gold" />
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-3">
            {authHighlights.map(([value, label]) => (
              <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl">
                <div className="font-display text-2xl font-black text-gold">{value}</div>
                <div className="mt-1 text-xs font-bold uppercase text-mist">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

function AuthPage({ mode }) {
  const [form, setForm] = useState({
    fullName: "",
    email: localStorage.getItem("primebid-auth-email") || "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: getStoredRole(),
    remember: true,
    demoPin: "",
    otp: "",
    resetPassword: "",
    resetConfirm: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [forgotStep, setForgotStep] = useState("email");

  const isForgot = mode === "forgot";
  const isOtp = mode === "otp";
  const isDemoAuth = !isSupabaseConfigured;
  const needsDemoPin = (mode === "login" || mode === "register") && isDemoAuth;
  const selectedRole = normalizeRole(form.role);
  const selectedRoleLabel = roleLabels[selectedRole];
  const cardTitle = mode === "login" ? `Sign in as ${selectedRoleLabel}` : mode === "register" ? `Create ${selectedRoleLabel} account` : mode === "otp" ? "Verify OTP code" : "Reset your password";

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  };

  const pushToast = (text, type = "success") => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, text, type }].slice(-3));
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 3600);
  };

  const validateEmail = () => {
    if (!form.email.trim()) return "Email is required";
    if (!emailPattern.test(form.email)) return "Enter a valid business email";
    return "";
  };

  const validatePassword = (field = "password") => {
    const value = form[field];
    if (!value) return "Password is required";
    if (value.length < 8) return "Use at least 8 characters";
    return "";
  };

  const runAuth = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (mode === "login") {
      nextErrors.email = validateEmail();
      if (isSupabaseConfigured) nextErrors.password = validatePassword();
      if (needsDemoPin && form.demoPin !== demoLoginPin) nextErrors.demoPin = "Enter the correct demo PIN";
    }

    if (mode === "register") {
      if (!form.fullName.trim()) nextErrors.fullName = "Full name is required";
      nextErrors.email = validateEmail();
      if (!form.phone.trim()) nextErrors.phone = "Phone number is required";
      if (!roleLabels[normalizeRole(form.role)]) nextErrors.role = "Choose your account role";
      nextErrors.password = validatePassword();
      if (form.password !== form.confirmPassword) nextErrors.confirmPassword = "Passwords must match";
      if (needsDemoPin && form.demoPin !== demoLoginPin) nextErrors.demoPin = "Enter the correct demo PIN";
    }

    if (mode === "otp") {
      nextErrors.email = validateEmail();
      if (!/^\d{6}$/.test(form.otp)) nextErrors.otp = "Enter the 6 digit verification code";
    }

    if (isForgot) {
      if (forgotStep === "email") nextErrors.email = validateEmail();
      if (forgotStep === "otp" && !/^\d{6}$/.test(form.otp)) nextErrors.otp = "Enter the 6 digit recovery code";
      if (forgotStep === "reset") {
        nextErrors.resetPassword = validatePassword("resetPassword");
        if (form.resetPassword !== form.resetConfirm) nextErrors.resetConfirm = "Passwords must match";
      }
    }

    Object.keys(nextErrors).forEach((key) => {
      if (!nextErrors[key]) delete nextErrors[key];
    });

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      pushToast("Please fix the highlighted fields.", "error");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        if (isSupabaseConfigured) {
          const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
          if (error) throw error;
        } else {
          await wait();
        }
        localStorage.setItem("primebid-auth-email", form.email);
        const role = persistAuthSession(form.role);
        pushToast(isSupabaseConfigured ? `Signed in as ${roleLabels[role]}.` : `Demo sign in as ${roleLabels[role]}. Add Supabase env keys for live auth.`);
        window.setTimeout(() => { window.location.hash = getRoleHomeRoute(role); }, 700);
      }

      if (mode === "register") {
        if (isSupabaseConfigured) {
          const { error } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: {
              data: {
                full_name: form.fullName,
                phone: form.phone,
                role: normalizeRole(form.role)
              }
            }
          });
          if (error) throw error;
        } else {
          await wait();
        }
        localStorage.setItem("primebid-auth-email", form.email);
        const role = persistRole(form.role);
        pushToast(`${roleLabels[role]} account created. Verify your OTP to finish setup.`);
        window.setTimeout(() => { window.location.hash = "otp-verification"; }, 650);
      }

      if (mode === "otp") {
        if (isSupabaseConfigured) {
          const { error } = await supabase.auth.verifyOtp({ email: form.email, token: form.otp, type: "signup" });
          if (error) throw error;
        } else {
          await wait();
        }
        const role = persistAuthSession(getStoredRole());
        pushToast(`OTP verified. Opening ${roleLabels[role]} workspace.`);
        window.setTimeout(() => { window.location.hash = getRoleHomeRoute(role); }, 650);
      }

      if (isForgot && forgotStep === "email") {
        if (isSupabaseConfigured) {
          const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
            redirectTo: `${window.location.origin}/#forgot-password`
          });
          if (error) throw error;
        } else {
          await wait();
        }
        localStorage.setItem("primebid-auth-email", form.email);
        setForgotStep("otp");
        pushToast("Reset code sent. Enter the OTP from your email.");
      } else if (isForgot && forgotStep === "otp") {
        if (isSupabaseConfigured) {
          const { error } = await supabase.auth.verifyOtp({ email: form.email, token: form.otp, type: "recovery" });
          if (error) throw error;
        } else {
          await wait();
        }
        setForgotStep("reset");
        pushToast("Code verified. Set a new password.");
      } else if (isForgot && forgotStep === "reset") {
        if (isSupabaseConfigured) {
          const { error } = await supabase.auth.updateUser({ password: form.resetPassword });
          if (error) throw error;
        } else {
          await wait();
        }
        pushToast("Password reset complete. You can sign in now.");
        window.setTimeout(() => { window.location.hash = "login"; }, 650);
      }
    } catch (error) {
      pushToast(error.message || "Authentication failed. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const socialLogin = async (provider) => {
    if (!isSupabaseConfigured && form.demoPin !== demoLoginPin) {
      setErrors((current) => ({ ...current, demoPin: "Enter the correct demo PIN first" }));
      pushToast("Enter the demo PIN before using demo social login.", "error");
      return;
    }

    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: { redirectTo: window.location.origin }
        });
        if (error) throw error;
      } else {
        await wait(580);
        const role = persistAuthSession(form.role);
        pushToast(`${provider === "google" ? "Google" : "GitHub"} demo sign in as ${roleLabels[role]}. Configure Supabase env keys for OAuth.`);
        window.setTimeout(() => { window.location.hash = getRoleHomeRoute(role); }, 650);
      }
    } catch (error) {
      pushToast(error.message || "Social login failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const passwordAction = (
    <button type="button" onClick={() => setShowPassword((value) => !value)} className="text-mist transition hover:text-snow" aria-label={showPassword ? "Hide password" : "Show password"}>
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );

  const confirmAction = (
    <button type="button" onClick={() => setShowConfirm((value) => !value)} className="text-mist transition hover:text-snow" aria-label={showConfirm ? "Hide password" : "Show password"}>
      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-midnight px-4 py-4 text-snow sm:px-6 lg:px-8">
      <AuthToastStack items={toasts} />
      <div className="absolute left-[-8rem] top-[-8rem] size-96 rounded-full bg-blue-premium/20 blur-3xl" />
      <div className="absolute bottom-[-10rem] right-[-6rem] size-[28rem] rounded-full bg-gold/15 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1.04fr_0.96fr]">
        <AuthBrandPanel mode={mode} />

        <section className="flex min-h-[calc(100vh-2rem)] items-center justify-center py-4">
          <motion.div
            key={`${mode}-${forgotStep}`}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-panel/75 p-5 shadow-glass backdrop-blur-2xl sm:p-7"
          >
            <div className="mb-7 flex items-center justify-between gap-4">
              <a href="#login" className="inline-flex items-center gap-2 text-sm font-bold text-mist transition hover:text-snow">
                <ArrowLeft size={16} />
                Secure entry
              </a>
              <span className={`rounded-full border px-3 py-1 text-xs font-black ${isSupabaseConfigured ? "border-green-success/30 bg-green-success/10 text-green-success" : "border-gold/30 bg-gold/10 text-gold"}`}>
                {isSupabaseConfigured ? "Supabase live" : "Demo auth"}
              </span>
            </div>

            <div className="mb-7">
              <div className="chip mb-4 border-blue-premium/25 bg-blue-premium/10 text-snow"><ShieldCheck size={15} /> Bank-grade session security</div>
              <h2 className="font-display text-3xl font-black sm:text-4xl">{cardTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-mist">
                {isForgot && forgotStep === "otp" ? "Enter the recovery OTP sent to your inbox." : isForgot && forgotStep === "reset" ? "Create a fresh password for your PrimeBid account." : authModes[mode].copy}
              </p>
            </div>

            <form onSubmit={runAuth} className="grid gap-4">
              {mode === "register" && (
                <AuthInput icon={UserPlus} label="Full name" value={form.fullName} onChange={(event) => update("fullName", event.target.value)} placeholder="Amina Mwangi" error={errors.fullName} />
              )}

              {(mode !== "forgot" || forgotStep !== "reset") && (
                <AuthInput icon={Mail} label="Email address" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="you@company.com" error={errors.email} />
              )}

              {mode === "register" && (
                <AuthInput icon={Phone} label="Phone number" value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+254 700 000 000" error={errors.phone} />
              )}

              {(mode === "login" || mode === "register") && (
                <div>
                  <span className="mb-2 block text-sm font-bold text-snow">Role selection</span>
                  <div className="grid gap-2 lg:grid-cols-3">
                    {roleOptions.map(([key, label, Icon, description]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => update("role", key)}
                        className={`flex min-h-32 flex-col items-start justify-start gap-2 rounded-2xl border px-4 py-4 text-left transition ${selectedRole === key ? "border-gold/50 bg-gold/15 text-gold shadow-gold" : "border-white/10 bg-white/[0.045] text-mist hover:bg-white/[0.075] hover:text-snow"}`}
                      >
                        <span className="flex items-center gap-2 text-sm font-black">
                          <Icon size={17} />
                          {label}
                        </span>
                        <span className={`text-xs font-semibold leading-5 ${selectedRole === key ? "text-snow" : "text-mist"}`}>{description}</span>
                      </button>
                    ))}
                  </div>
                  {errors.role && <span className="mt-2 block text-xs font-bold text-red-200">{errors.role}</span>}
                </div>
              )}

              {(mode === "register" || (mode === "login" && isSupabaseConfigured)) && (
                <AuthInput icon={LockKeyhole} label="Password" type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => update("password", event.target.value)} placeholder="Minimum 8 characters" error={errors.password} action={passwordAction} />
              )}

              {needsDemoPin && (
                <div>
                  <AuthInput icon={KeyRound} label="Demo access PIN" type="password" inputMode="numeric" value={form.demoPin} onChange={(event) => update("demoPin", event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Enter demo PIN" error={errors.demoPin} />
                  <p className="mt-2 text-xs font-bold text-gold">Temporary frontend PIN required until backend auth is connected.</p>
                </div>
              )}

              {mode === "register" && (
                <AuthInput icon={LockKeyhole} label="Confirm password" type={showConfirm ? "text" : "password"} value={form.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} placeholder="Repeat password" error={errors.confirmPassword} action={confirmAction} />
              )}

              {(mode === "otp" || (isForgot && forgotStep === "otp")) && (
                <AuthInput icon={KeyRound} label="OTP verification code" inputMode="numeric" value={form.otp} onChange={(event) => update("otp", event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" error={errors.otp} />
              )}

              {isForgot && forgotStep === "reset" && (
                <>
                  <AuthInput icon={LockKeyhole} label="New password" type={showPassword ? "text" : "password"} value={form.resetPassword} onChange={(event) => update("resetPassword", event.target.value)} placeholder="Minimum 8 characters" error={errors.resetPassword} action={passwordAction} />
                  <AuthInput icon={LockKeyhole} label="Confirm new password" type={showConfirm ? "text" : "password"} value={form.resetConfirm} onChange={(event) => update("resetConfirm", event.target.value)} placeholder="Repeat new password" error={errors.resetConfirm} action={confirmAction} />
                </>
              )}

              {mode === "login" && (
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <label className="flex items-center gap-2 font-bold text-mist">
                    <input type="checkbox" checked={form.remember} onChange={(event) => update("remember", event.target.checked)} className="size-4 rounded border-white/20 bg-white/10 text-gold" />
                    Remember me
                  </label>
                  <a href="#forgot-password" className="font-black text-gold transition hover:text-snow">Forgot password?</a>
                </div>
              )}

              <AuthButton loading={loading}>
                {mode === "login" ? "Sign in to PrimeBid" : mode === "register" ? "Create secure account" : mode === "otp" ? "Verify OTP" : forgotStep === "email" ? "Send reset OTP" : forgotStep === "otp" ? "Verify recovery code" : "Reset password"}
              </AuthButton>
            </form>

            {mode === "login" && (
              <>
                <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-mist">
                  <span className="h-px flex-1 bg-white/10" />
                  or continue with
                  <span className="h-px flex-1 bg-white/10" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={() => socialLogin("google")} className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-4 font-black text-snow transition hover:-translate-y-0.5 hover:bg-white/[0.08]">
                    <Chrome size={18} />
                    Google
                  </button>
                  <button type="button" onClick={() => socialLogin("github")} className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-4 font-black text-snow transition hover:-translate-y-0.5 hover:bg-white/[0.08]">
                    <Github size={18} />
                    GitHub
                  </button>
                </div>
              </>
            )}

            <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center text-sm text-mist">
              {mode === "login" ? (
                <>New to PrimeBid? <a href="#register" className="font-black text-gold">Create account</a></>
              ) : mode === "register" ? (
                <>Already verified? <a href="#login" className="font-black text-gold">Sign in</a></>
              ) : mode === "otp" ? (
                <>Need a new account? <a href="#register" className="font-black text-gold">Register again</a></>
              ) : (
                <>Remembered your password? <a href="#login" className="font-black text-gold">Back to login</a></>
              )}
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}

function Hero({ socketStatus, auctions }) {
  const heroLots = auctions.length ? auctions : initialAuctions;
  const featured = heroLots[0];
  const secondary = heroLots.slice(1, 4);
  const submitSearch = (event) => {
    event.preventDefault();
    window.location.hash = "auctions";
  };

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-midnight">
      <div className="absolute -left-32 top-10 size-96 rounded-full bg-blue-premium/20 blur-3xl" />
      <div className="absolute right-[-10rem] top-28 size-[28rem] rounded-full bg-gold/10 blur-3xl" />

      <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl content-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_30rem] lg:px-8 lg:py-16">
        <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-4xl">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="chip live-pulse border-green-success/25 bg-green-success/10">{socketStatus} market stream</span>
            <span className="chip border-gold/25 bg-gold/10 text-gold"><ShieldCheck size={15} /> verified lots</span>
          </div>
          <h1 className="font-display text-5xl font-black leading-[0.95] text-snow sm:text-6xl lg:text-7xl">
            Discover verified auctions with confidence.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-mist">
            PrimeBid brings high-value vehicles, property, electronics, luxury goods, and business assets into one trusted auction marketplace with live bidding, seller review, and clear lot information.
          </p>

          <form onSubmit={submitSearch} className="mt-8 grid max-w-3xl gap-3 rounded-[1.75rem] border border-white/10 bg-panel/80 p-3 shadow-glass backdrop-blur-2xl sm:grid-cols-[auto_1fr_auto]">
            <div className="grid size-12 place-items-center rounded-2xl bg-white/10 text-gold">
              <Search size={20} />
            </div>
            <input className="min-h-12 min-w-0 bg-transparent px-1 font-bold text-snow outline-none placeholder:text-mist" placeholder="Search live lots, sellers, vehicles, property..." />
            <button className="premium-button min-h-12 px-5"><Zap size={18} /> Explore Lots</button>
          </form>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["524", "verified active lots"],
              ["5", "auction categories"],
              ["24/7", "live monitoring"]
            ].map(([value, label]) => (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl"
                key={label}
              >
                <div className="font-display text-2xl font-black text-snow">{value}</div>
                <div className="mt-1 text-xs font-bold uppercase text-mist">{label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.aside initial={{ opacity: 0, x: 26 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="self-center rounded-[2rem] border border-white/10 bg-panel/80 p-4 shadow-glass backdrop-blur-2xl">
          <img className="h-64 w-full rounded-[1.5rem] object-cover" src={featured.image} alt={featured.title} />
          <div className="p-2 pt-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="chip live-pulse bg-green-success/10">Featured live lot</span>
              <span className="chip">{featured.category}</span>
              <span className="chip border-blue-premium/20 bg-blue-premium/10">{featured.location}</span>
            </div>
            <h2 className="font-display text-2xl font-black">{featured.title}</h2>
            <p className="mt-2 text-sm text-mist">Seller: {featured.seller}</p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <Metric label="Current bid" value={formatKes(featured.bid)} />
              <Metric label="Bids" value={featured.bids} />
              <Metric label="Ends" value={featured.time} />
            </div>
            <div className="mt-5 grid grid-cols-[1fr_auto] gap-3">
              <a href={`#lot-${featured.id}`} className="premium-button">Enter Bid Room</a>
              <a href="#auctions" className="grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/5 text-gold">
                <Eye size={18} />
              </a>
            </div>
          </div>
        </motion.aside>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-3 backdrop-blur-xl md:grid-cols-3">
          {secondary.map((lot) => (
            <a href={`#lot-${lot.id}`} key={lot.id} className="group grid grid-cols-[4.5rem_1fr_auto] items-center gap-3 rounded-2xl p-2 transition hover:bg-white/[0.06]">
              <img className="h-16 w-16 rounded-2xl object-cover" src={lot.image} alt={lot.title} />
              <div className="min-w-0">
                <div className="truncate font-display font-black">{lot.title}</div>
                <div className="text-sm font-bold text-gold">{formatKes(lot.bid)}</div>
              </div>
              <ChevronRight className="text-mist transition group-hover:text-snow" size={18} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryNav() {
  const categories = [
    [Smartphone, "Electronics", "342 lots", "verified devices", "auctions"],
    [Car, "Vehicles", "118 lots", "logbook checked", "vehicles"],
    [Building2, "Property", "64 lots", "escrow deposits", "property"],
    [Crown, "Luxury", "92 lots", "authenticated", "auctions"],
    [BriefcaseBusiness, "Business", "40 lots", "asset disposal", "auctions"]
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <div className="chip mb-3"><Sparkles size={15} /> Curated desks</div>
          <h2 className="font-display text-3xl font-black">Bid by asset class</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-mist">Each category carries the checks that matter: ownership, condition, reserve, seller quality, and buyer readiness.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {categories.map(([Icon, title, count, detail, route]) => (
          <motion.a href={`#${route}`} whileHover={{ y: -6 }} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-glass backdrop-blur-xl transition hover:border-gold/30" key={title}>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent opacity-0 transition group-hover:opacity-100" />
            <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-white/10 text-gold transition group-hover:bg-gold group-hover:text-slate-950">
              <Icon size={22} />
            </div>
            <div className="font-display text-lg font-black">{title}</div>
            <div className="mt-1 text-sm text-mist">{count}</div>
            <div className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase text-green-success">
              <BadgeCheck size={14} />
              {detail}
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}

function MarketPulse({ auctions }) {
  const lots = auctions.length ? auctions : initialAuctions;
  const topLot = lots.reduce((top, lot) => lot.bid > top.bid ? lot : top, lots[0]);
  const totalBids = lots.reduce((sum, lot) => sum + lot.bids, 0);
  const totalWatchers = lots.reduce((sum, lot) => sum + lot.watchers, 0);

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/10 bg-panel/70 p-5 shadow-glass">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="chip mb-3 live-pulse">Live marketplace</div>
              <h2 className="font-display text-3xl font-black">A clear entry point for every bidder</h2>
            </div>
            <a href="#auctions" className="blue-button"><Gavel size={18} /> Browse Auctions</a>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="Total bids" value={totalBids} />
            <Metric label="Watchers" value={totalWatchers} />
            <Metric label="Top bid" value={formatKes(topLot.bid)} />
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-glass">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-2xl font-black">How it works</h3>
            <ShieldCheck className="text-green-success" />
          </div>
          <div className="grid gap-3">
            {["Explore verified lots by category", "Review seller, condition, and reserve details", "Enter the live bid room when ready"].map((item) => (
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm font-bold text-mist" key={item}>
                <CheckCircle2 size={17} className="text-green-success" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AuctionCard({ auction, compact = false }) {
  return (
    <motion.article whileHover={{ y: -8 }} className="soft-card group overflow-hidden rounded-[1.75rem]">
      <div className={`relative ${compact ? "h-48" : "h-56"} bg-gradient-to-br ${auction.accent}`}>
        <img className="h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-105" src={auction.image} alt={auction.title} />
        <div className="absolute left-4 top-4 chip live-pulse bg-midnight/70">Live</div>
        <button className="absolute right-4 top-4 grid size-11 place-items-center rounded-2xl bg-midnight/70 text-white backdrop-blur-xl transition hover:text-gold">
          <Heart size={18} />
        </button>
      </div>
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="chip">{auction.category}</span>
          <span className="flex items-center gap-1 text-sm font-bold text-green-success"><Timer size={16} /> {auction.time}</span>
        </div>
        <h3 className="font-display text-xl font-black">{auction.title}</h3>
        <p className="mt-1 text-sm text-mist">Seller: {auction.seller} / {auction.location}</p>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-mist">Current bid</div>
            <div className="font-display text-2xl font-black text-gold">{formatKes(auction.bid)}</div>
          </div>
          <div className="text-right text-sm font-bold text-mist">{auction.bids} bids</div>
        </div>
        <div className="mt-5 h-2 rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-green-success via-blue-premium to-gold" style={{ width: `${auction.progress}%` }} />
        </div>
        <div className="mt-5 grid grid-cols-[1fr_auto] gap-3">
          <a href={`#lot-${auction.id}`} className="premium-button py-3">Place Bid</a>
          <a href={`#lot-${auction.id}`} className="grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/5 text-mist hover:text-white">
            <Eye size={18} />
          </a>
        </div>
      </div>
    </motion.article>
  );
}

function HomePage({ socketStatus, auctions }) {
  return (
    <>
      <Hero socketStatus={socketStatus} auctions={auctions} />
      <MarketPulse auctions={auctions} />
      <CategoryNav />
      <AuctionsPreview auctions={auctions} />
      <IntegrationStrip />
    </>
  );
}

function AuctionsPreview({ auctions }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div className="chip mb-3"><Activity size={15} /> Premium Marketplace</div>
          <h2 className="font-display text-4xl font-black">Live lots moving now</h2>
          <p className="mt-3 max-w-2xl text-mist">Scan bid momentum, reserve progress, watchlists, and seller trust signals before entering a bid room.</p>
        </div>
        <a href="#auctions" className="blue-button">Open Marketplace <ChevronRight size={18} /></a>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {auctions.map((auction) => <AuctionCard auction={auction} key={auction.id} />)}
      </div>
    </section>
  );
}

function AuctionsPage({ auctions }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const filtered = auctions.filter((auction) => {
    const matchesQuery = `${auction.title} ${auction.seller} ${auction.category}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "All" || auction.category === category;
    return matchesQuery && matchesCategory;
  });

  return (
    <>
      <PageHeader
        eyebrow="Auction Marketplace"
        title="Advanced live auction discovery"
        copy="Search, filter, watch, inspect, and bid on verified live lots with reserve tracking and seller trust signals."
        action={<a href="#wallet" className="premium-button"><Wallet size={18} /> Check Wallet</a>}
      />
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="glass mb-6 grid gap-3 rounded-[2rem] p-4 lg:grid-cols-[1fr_auto_auto]">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-mist">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent outline-none" placeholder="Search title, seller, category..." />
          </div>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-2xl border border-white/10 bg-midnight px-4 py-3 font-bold text-snow">
            {["All", "Vehicles", "Luxury", "Electronics", "Property"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <button className="blue-button"><Filter size={18} /> Smart Filters</button>
        </div>
        <div className="mb-5 text-sm font-bold text-mist">{filtered.length} matching lots</div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {filtered.map((auction) => <AuctionCard auction={auction} key={auction.id} />)}
        </div>
      </section>
    </>
  );
}

function AssetPage({ type, auctions }) {
  const isVehicle = type === "Vehicles";
  const items = auctions.filter((auction) => auction.category === type);
  const Icon = isVehicle ? Car : Building2;

  return (
    <>
      <PageHeader
        eyebrow={`${type} Desk`}
        title={isVehicle ? "Verified vehicle auctions" : "Property bidding room"}
        copy={isVehicle ? "Browse logbook-verified vehicles with inspection notes, deposit holds, and seller trust scores." : "Review property lots with document checks, escrow deposits, and reserve transparency."}
        action={<a href="#auctions" className="blue-button"><Icon size={18} /> Browse All Lots</a>}
      />
      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-10 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
        <div className="glass rounded-[2rem] p-6">
          <Icon className="mb-5 text-gold" size={32} />
          <h2 className="font-display text-2xl font-black">{isVehicle ? "Vehicle checks" : "Property checks"}</h2>
          <div className="mt-5 space-y-3">
            {(isVehicle
              ? ["Logbook verification", "Mileage and battery report", "Transfer fee estimate", "Deposit hold rules"]
              : ["Title deed review", "Survey map and location", "Escrow deposit workflow", "Advocate settlement status"]
            ).map((item) => (
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3" key={item}>
                <CheckCircle2 className="text-green-success" size={18} />
                <span className="font-bold">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {items.map((auction) => <AuctionCard auction={auction} compact key={auction.id} />)}
        </div>
      </section>
    </>
  );
}

function LotPage({ lotId, auctions }) {
  const auction = auctions.find((item) => item.id === lotId) || auctions[0];

  return (
    <>
      <PageHeader
        eyebrow={`Lot ${auction.id}`}
        title={auction.title}
        copy={`${auction.inspection} Current bid is ${formatKes(auction.bid)} and the auction ends in ${auction.time}.`}
        action={<a href="#wallet" className="premium-button"><Wallet size={18} /> Open Wallet</a>}
      />
      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-10 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
        <div className="glass overflow-hidden rounded-[2rem]">
          <img className="h-[420px] w-full object-cover" src={auction.image} alt={auction.title} />
          <div className="grid gap-4 p-6 md:grid-cols-3">
            <Metric label="Current bid" value={formatKes(auction.bid)} />
            <Metric label="Reserve" value={formatKes(auction.reserve)} />
            <Metric label="Watchers" value={auction.watchers} />
          </div>
        </div>
        <aside className="space-y-5">
          <div className="soft-card rounded-[2rem] p-6">
            <div className="chip live-pulse mb-4">Live Bid Room</div>
            <h2 className="font-display text-2xl font-black">Place bid or activate auto-bid</h2>
            <div className="mt-5 grid gap-3">
              <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 outline-none" placeholder={`Minimum ${formatKes(auction.bid + 25000)}`} />
              <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 outline-none" placeholder="Secret auto-bid maximum" />
              <button className="premium-button">Submit Bid</button>
              <button className="blue-button">Enable Auto-Bid</button>
            </div>
          </div>
          <div className="glass rounded-[2rem] p-6">
            <h3 className="font-display text-xl font-black">Lot details</h3>
            <div className="mt-4 space-y-3">
              {auction.specs.map((spec) => (
                <div className="flex items-center gap-3 text-mist" key={spec}>
                  <PackageCheck size={17} className="text-green-success" />
                  {spec}
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-bold text-mist">
              <Camera size={18} className={auction.cameraAvailable ? "text-green-success" : "text-orange-cta"} />
              Camera evidence {auction.cameraAvailable ? "available for this lot" : "not yet attached"}
            </div>
            <p className="mt-5 rounded-2xl bg-white/5 p-4 text-sm leading-6 text-mist">{auction.payment}</p>
          </div>
        </aside>
      </section>
    </>
  );
}

function DashboardPreview() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <BidSummaryPanel />
        <AnalyticsPanel />
      </div>
    </section>
  );
}

function AuctioneeDashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Auctionee Dashboard"
        title="Your bids, wins, watchlist, and alerts"
        copy="A complete auctionee control center for active bids, winning history, watchlist decisions, notifications, and auction performance."
        action={<a href="#wallet" className="premium-button"><Wallet size={18} /> Open Wallet</a>}
      />
      <DashboardPreview />
      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        {["Watchlist: 34 active lots", "Auto-bids: 6 protected bids", "Notifications: 12 unread"].map((item) => (
          <div className="glass rounded-3xl p-5" key={item}>
            <User className="mb-4 text-gold" />
            <h3 className="font-display text-xl font-black">{item}</h3>
            <p className="mt-2 text-sm text-mist">Personalized auctionee state ready for backend API hydration.</p>
          </div>
        ))}
      </section>
    </>
  );
}

function AuctioneerDashboardPage({ pendingLots, approvedLots, rejectedLots }) {
  const sellerLots = [
    ...pendingLots.map((lot) => ({ ...lot, sellerStatus: "Pending admin review" })),
    ...approvedLots.slice(0, 3).map((lot) => ({ ...lot, sellerStatus: "Live in marketplace" })),
    ...rejectedLots.map((lot) => ({ ...lot, sellerStatus: "Needs revision" }))
  ];
  const liveLots = sellerLots.filter((lot) => lot.sellerStatus === "Live in marketplace").length;

  return (
    <>
      <PageHeader
        eyebrow="Auctioneer Dashboard"
        title="Seller workspace for uploads, approvals, and payouts"
        copy="Auctioneers manage submitted lots, proof readiness, admin review status, seller performance, and payout preparation without seeing admin moderation tools."
        action={<a href="#sell" className="premium-button"><ImagePlus size={18} /> Upload New Lot</a>}
      />
      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-10 sm:px-6 lg:grid-cols-[1fr_0.85fr] lg:px-8">
        <div className="glass rounded-[2rem] p-6">
          <div className="grid gap-3 md:grid-cols-3">
            <Metric label="Pending review" value={pendingLots.length} />
            <Metric label="Live lots" value={liveLots} />
            <Metric label="Payouts due" value="KES 286k" />
          </div>
          <div className="mt-6 space-y-3">
            {sellerLots.slice(0, 4).map((lot) => (
              <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 sm:grid-cols-[4rem_1fr_auto]" key={`${lot.id}-${lot.sellerStatus}`}>
                <img className="h-16 w-16 rounded-2xl object-cover" src={lot.image} alt={lot.title} />
                <div className="min-w-0">
                  <div className="truncate font-display text-lg font-black">{lot.title}</div>
                  <div className="text-sm text-mist">{lot.id} / {lot.category}</div>
                </div>
                <span className="self-center rounded-full border border-gold/20 bg-gold/10 px-3 py-2 text-xs font-black text-gold">{lot.sellerStatus}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="soft-card rounded-[2rem] p-6">
          <ClipboardCheck className="mb-5 text-gold" size={34} />
          <h2 className="font-display text-3xl font-black">What sellers can do</h2>
          <div className="mt-5 space-y-3">
            {["Upload lots with reserve price and proof", "Track whether admin approved, rejected, or still reviews", "Prepare payout information after completed sales", "Edit rejected drafts before resubmission"].map((item) => (
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm font-bold text-mist" key={item}>
                <CheckCircle2 className="text-green-success" size={18} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function DashboardPage({ role, pendingLots, approvedLots, rejectedLots }) {
  return normalizeRole(role) === "auctioneer"
    ? <AuctioneerDashboardPage pendingLots={pendingLots} approvedLots={approvedLots} rejectedLots={rejectedLots} />
    : <AuctioneeDashboardPage />;
}

function SellerLotsPage({ pendingLots, approvedLots, rejectedLots }) {
  const groups = [
    ["Pending Review", pendingLots, "Admin has not published these lots yet."],
    ["Live Lots", approvedLots.slice(0, 6), "Published lots visible to auctionees."],
    ["Needs Revision", rejectedLots, "Revise proof, reserve, or item information before resubmitting."]
  ];

  return (
    <>
      <PageHeader
        eyebrow="Seller Inventory"
        title="Your submitted lots and review status"
        copy="A seller-only view of drafts, pending approvals, live listings, and rejected submissions. Admin controls stay hidden from this workspace."
        action={<a href="#sell" className="premium-button"><ImagePlus size={18} /> Upload Lot</a>}
      />
      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-16 sm:px-6 lg:px-8">
        {groups.map(([title, lots, copy]) => (
          <div className="soft-card rounded-[2rem] p-6" key={title}>
            <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h2 className="font-display text-2xl font-black">{title}</h2>
                <p className="text-sm text-mist">{copy}</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-gold">{lots.length} lots</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {lots.map((lot) => (
                <article className="rounded-3xl border border-white/10 bg-white/5 p-4" key={`${title}-${lot.id}`}>
                  <img className="mb-4 h-40 w-full rounded-2xl object-cover" src={lot.image} alt={lot.title} />
                  <div className="mb-2 flex flex-wrap gap-2">
                    <span className="chip">{lot.id}</span>
                    <span className="chip">{lot.category}</span>
                  </div>
                  <h3 className="font-display text-xl font-black">{lot.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-mist">{lot.approvalNote || lot.inspection}</p>
                </article>
              ))}
              {lots.length === 0 && <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-mist">Nothing here yet.</div>}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}

function SellerPayoutsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Seller Payouts"
        title="Payouts, settlement status, and seller fees"
        copy="Auctioneers see only seller finance information: completed sales, expected payout dates, settlement holds, and fee estimates."
        action={<button className="premium-button"><CreditCard size={18} /> Add Payout Method</button>}
      />
      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-16 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-8">
        <div className="glass rounded-[2rem] p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="Available payout" value="KES 286k" />
            <Metric label="In escrow" value="KES 920k" />
            <Metric label="Platform fees" value="KES 42k" />
          </div>
          <div className="mt-6 space-y-3">
            {["AU-901 settlement pending buyer confirmation", "AU-602 payout scheduled Friday", "AU-778 escrow hold active"].map((item) => (
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-bold text-mist" key={item}>
                <span>{item}</span>
                <CheckCircle2 className="text-green-success" size={18} />
              </div>
            ))}
          </div>
        </div>
        <div className="soft-card rounded-[2rem] p-6">
          <Wallet className="mb-5 text-gold" size={34} />
          <h2 className="font-display text-3xl font-black">Seller finance only</h2>
          <p className="mt-3 leading-7 text-mist">Bidder wallets and client payment holds are kept separate from seller payout records.</p>
        </div>
      </section>
    </>
  );
}

function BidSummaryPanel() {
  return (
    <div className="glass rounded-[2rem] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-black">Bid activity</h2>
          <p className="text-mist">Active bids, watchlist movement, and winning history.</p>
        </div>
        <Gavel className="text-gold" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Metric label="Active bids" value="12" />
        <Metric label="Auto-bids" value="6" />
        <Metric label="Auctions won" value="7" />
        <Metric label="Watchlist" value="34" />
      </div>
      <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
        <div className="mb-4 flex items-center justify-between">
          <strong>Bid timeline</strong>
          <span className="text-sm text-green-success">Live</span>
        </div>
        {["AU-901 bid protected", "Rolex watch added to watchlist", "Property lot inspection reviewed"].map((item) => (
          <div className="flex items-center justify-between border-t border-white/10 py-3 text-sm" key={item}>
            <span className="text-mist">{item}</span>
            <CheckCircle2 size={16} className="text-green-success" />
          </div>
        ))}
      </div>
    </div>
  );
}

function WalletPanel() {
  return (
    <div className="glass rounded-[2rem] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-black">Wallet</h2>
          <p className="text-mist">Balance, holds, wins, and transaction records.</p>
        </div>
        <Wallet className="text-gold" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Metric label="Wallet balance" value="KES 110,240" />
        <Metric label="Active holds" value="KES 42,000" />
        <Metric label="Auctions won" value="7" />
        <Metric label="Watchlist" value="34" />
      </div>
      <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
        <div className="mb-4 flex items-center justify-between">
          <strong>Transaction history</strong>
          <span className="text-sm text-green-success">M-Pesa ready</span>
        </div>
        {["STK push pending - KES 15,000", "Bid hold released - KES 8,500", "Auction won payment - KES 42,000"].map((item) => (
          <div className="flex items-center justify-between border-t border-white/10 py-3 text-sm" key={item}>
            <span className="text-mist">{item}</span>
            <CheckCircle2 size={16} className="text-green-success" />
          </div>
        ))}
      </div>
    </div>
  );
}

function WalletPage() {
  return (
    <>
      <PageHeader
        eyebrow="Wallet"
        title="Balances, holds, deposits, and refunds"
        copy="A dedicated bidder finance center for available balance, active bid holds, deposits, refunds, and transaction history."
        action={<button className="premium-button"><CreditCard size={18} /> Add Funds</button>}
      />
      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-10 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-8">
        <WalletPanel />
        <div className="grid gap-5">
          <div className="soft-card rounded-[2rem] p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-black">Balance breakdown</h2>
                <p className="text-sm text-mist">What is available, reserved, and pending.</p>
              </div>
              <Wallet className="text-gold" />
            </div>
            <div className="grid gap-3">
              {[
                ["Available balance", "KES 68,240", "Ready for new bids"],
                ["Active bid holds", "KES 42,000", "Reserved for live lots"],
                ["Pending deposits", "KES 15,000", "Awaiting confirmation"],
                ["Refundable balance", "KES 8,500", "Released from outbid lots"]
              ].map(([label, value, text]) => (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4" key={label}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-mist">{label}</span>
                    <strong className="text-gold">{value}</strong>
                  </div>
                  <p className="mt-1 text-sm text-mist">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-[2rem] p-6">
            <h2 className="font-display text-2xl font-black">Payment methods</h2>
            <div className="mt-4 grid gap-3">
              {["M-Pesa ending 042", "Visa card ending 9281", "Bank transfer approval"].map((method) => (
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-bold text-mist" key={method}>
                  <span>{method}</span>
                  <CheckCircle2 className="text-green-success" size={18} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function AnalyticsPanel() {
  return (
    <div className="soft-card rounded-[2rem] p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-black">Analytics</h2>
          <p className="text-mist">Bids and revenue volume.</p>
        </div>
        <TrendingUp className="text-green-success" />
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="bidGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="name" stroke="#94A3B8" />
            <YAxis stroke="#94A3B8" />
            <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16 }} />
            <Area type="monotone" dataKey="bids" stroke="#2563EB" fill="url(#bidGradient)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function AdminPage({ pendingLots, approvedLots, rejectedLots, onApproveLot, onRejectLot }) {
  return (
    <>
      <PageHeader
        eyebrow="Admin Control Center"
        title="Manage auctions, users, fraud, and revenue"
        copy="Production-grade admin workspace for approval queues, seller checks, fraud monitoring, reports, and Socket.IO activity."
        action={<button className="premium-button"><ShieldAlert size={18} /> Review Flags</button>}
      />
      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-10 sm:px-6 lg:grid-cols-[1fr_0.85fr] lg:px-8">
        <div className="glass rounded-[2rem] p-6">
          <div className="grid gap-3 md:grid-cols-3">
            <Metric label="Pending approvals" value={pendingLots.length} />
            <Metric label="Approved lots" value={approvedLots.length} />
            <Metric label="Revenue today" value="KES 5.4M" />
          </div>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16 }} />
                <Bar dataKey="revenue" fill="#F97316" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <ActivityFeed />
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <AdminApprovalQueue pendingLots={pendingLots} rejectedLots={rejectedLots} onApproveLot={onApproveLot} onRejectLot={onRejectLot} />
      </section>
    </>
  );
}

function AdminApprovalQueue({ pendingLots, rejectedLots, onApproveLot, onRejectLot }) {
  return (
    <div className="soft-card rounded-[2rem] p-6">
      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="font-display text-3xl font-black">Goods approval queue</h2>
          <p className="text-mist">Auctioneers upload goods here first. Admin approval publishes them to the public auction marketplace.</p>
        </div>
        <ClipboardCheck className="text-gold" size={30} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {pendingLots.map((lot) => (
          <article className="rounded-3xl border border-white/10 bg-white/5 p-4" key={lot.id}>
            <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
              <img className="h-40 w-full rounded-2xl object-cover" src={lot.image} alt={lot.title} />
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="chip">{lot.id}</span>
                  <span className="chip">{lot.category}</span>
                  <span className="chip"><Camera size={14} /> {lot.cameraAvailable ? "Camera proof" : "No camera proof"}</span>
                </div>
                <h3 className="font-display text-xl font-black">{lot.title}</h3>
                <p className="mt-1 text-sm text-mist">Uploaded by {lot.seller} in {lot.location}</p>
                <p className="mt-3 text-sm leading-6 text-mist">{lot.inspection}</p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button onClick={() => onApproveLot(lot.id)} className="premium-button py-3"><BadgeCheck size={18} /> Approve</button>
                  <button onClick={() => onRejectLot(lot.id)} className="blue-button bg-orange-cta py-3"><XCircle size={18} /> Reject</button>
                </div>
              </div>
            </div>
          </article>
        ))}
        {pendingLots.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-mist">No goods are waiting for approval right now.</div>
        )}
      </div>
      {rejectedLots.length > 0 && (
        <div className="mt-5 rounded-3xl border border-orange-cta/25 bg-orange-cta/10 p-4 text-sm text-mist">
          Rejected drafts: {rejectedLots.map((lot) => lot.title).join(", ")}
        </div>
      )}
    </div>
  );
}

function AuctioneerUploadPage({ onSubmitLot }) {
  const [form, setForm] = useState({
    title: "",
    seller: "Auctioneer Team",
    category: "Electronics",
    location: "Nairobi",
    reserve: "",
    cameraAvailable: true,
    image: ""
  });
  const [cameraStatus, setCameraStatus] = useState("Not checked");
  const [submitted, setSubmitted] = useState(null);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const checkCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("Camera API is not available in this browser");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setCameraStatus("Camera is available for live item proof");
      update("cameraAvailable", true);
    } catch {
      setCameraStatus("Camera permission was blocked or no camera was found");
      update("cameraAvailable", false);
    }
  };

  const submit = (event) => {
    event.preventDefault();
    const lot = {
      id: `AU-${Math.floor(1100 + Math.random() * 8000)}`,
      title: form.title || "Untitled uploaded lot",
      category: form.category,
      seller: form.seller || "Auctioneer",
      bid: Math.max(1000, Number(form.reserve || 0) * 0.75),
      reserve: Number(form.reserve || 0) || 100000,
      bids: 0,
      watchers: 0,
      progress: 10,
      time: "Pending",
      location: form.location || "Nairobi",
      image: form.image || "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80",
      accent: "from-green-success/25 to-blue-premium/20",
      specs: ["Auctioneer upload", "Proof pending", "Admin approval required", form.cameraAvailable ? "Camera proof available" : "Camera proof not attached"],
      inspection: "New auctioneer upload waiting for admin approval, document checks, and reserve confirmation.",
      payment: "Payment and bidding controls activate after admin approval.",
      status: "pending",
      cameraAvailable: form.cameraAvailable,
      approvalNote: "Submitted by auctioneer for admin review."
    };
    onSubmitLot(lot);
    setSubmitted(lot.id);
    setForm((current) => ({ ...current, title: "", reserve: "", image: "" }));
  };

  return (
    <>
      <PageHeader
        eyebrow="Auctioneer Workspace"
        title="Upload goods for admin approval"
        copy="Auctioneers can submit goods with reserve price, seller details, photos, and camera proof. The lot stays hidden until an admin approves it."
        action={<a href="#seller-lots" className="blue-button"><ClipboardCheck size={18} /> View My Lots</a>}
      />
      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-16 sm:px-6 lg:grid-cols-[1fr_0.85fr] lg:px-8">
        <form onSubmit={submit} className="soft-card rounded-[2rem] p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <input required value={form.title} onChange={(event) => update("title", event.target.value)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 outline-none" placeholder="Goods title" />
            <input value={form.seller} onChange={(event) => update("seller", event.target.value)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 outline-none" placeholder="Auctioneer or seller name" />
            <select value={form.category} onChange={(event) => update("category", event.target.value)} className="rounded-2xl border border-white/10 bg-midnight px-4 py-4 font-bold text-snow">
              {["Electronics", "Vehicles", "Property", "Luxury", "Business"].map((item) => <option key={item}>{item}</option>)}
            </select>
            <input value={form.location} onChange={(event) => update("location", event.target.value)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 outline-none" placeholder="Location" />
            <input type="number" min="1000" value={form.reserve} onChange={(event) => update("reserve", event.target.value)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 outline-none" placeholder="Reserve price in KES" />
            <input value={form.image} onChange={(event) => update("image", event.target.value)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 outline-none" placeholder="Image URL or uploaded file path" />
          </div>
          <label className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 font-bold text-mist">
            <input type="checkbox" checked={form.cameraAvailable} onChange={(event) => update("cameraAvailable", event.target.checked)} />
            Camera evidence is available for this item
          </label>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={checkCamera} className="blue-button"><Camera size={18} /> Check Camera</button>
            <button className="premium-button"><ImagePlus size={18} /> Submit for Approval</button>
          </div>
          {submitted && <p className="mt-4 rounded-2xl bg-green-success/10 p-4 text-sm font-bold text-green-success">Lot {submitted} submitted to admin approval queue.</p>}
        </form>
        <div className="glass rounded-[2rem] p-6">
          <Camera className="mb-5 text-gold" size={34} />
          <h2 className="font-display text-3xl font-black">Camera availability</h2>
          <p className="mt-3 leading-7 text-mist">Use camera proof for live condition checks, serial-number photos, packaging verification, and seller trust scoring.</p>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 font-bold text-mist">{cameraStatus}</div>
          <div className="mt-5 space-y-3">
            {["Admin approval required before publishing", "Rejected goods remain hidden", "Approved goods join public auctions"].map((item) => (
              <div className="flex items-center gap-3 text-mist" key={item}>
                <CheckCircle2 className="text-green-success" size={18} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function SupportPage({ role }) {
  const [messages, setMessages] = useState([
    ["assistant", "Hello, I can help with bidding, wallet balances, seller uploads, approvals, camera proof, and account questions."]
  ]);
  const [input, setInput] = useState("");
  const currentRole = normalizeRole(role);
  const supportAction =
    currentRole === "admin"
      ? <a href="#admin" className="premium-button"><ShieldAlert size={18} /> Admin Control</a>
      : currentRole === "auctioneer"
        ? <a href="#sell" className="premium-button"><Camera size={18} /> Upload Lot</a>
        : <a href="#auctions" className="premium-button"><Gavel size={18} /> Browse Auctions</a>;

  const replyFor = (text) => {
    const query = text.toLowerCase();
    if (query.includes("approve") || query.includes("admin")) return "Goods uploaded by auctioneers remain pending until an admin opens the approval queue, checks proof, then approves or rejects the lot.";
    if (query.includes("camera")) return "Camera proof helps verify the item condition. Auctioneers can check browser camera access from the upload page and mark camera evidence as available.";
    if (query.includes("pay") || query.includes("mpesa") || query.includes("wallet")) return "Wallet balances, bid holds, deposits, refunds, and payment methods live on the Wallet page.";
    if (query.includes("bid")) return "Open a lot, enter a manual bid or auto-bid limit, then submit. The UI already separates public bidding from admin-only approval.";
    return "I can guide the customer to browse auctions, place bids, fund the wallet, contact an auctioneer, or check admin approval status.";
  };

  const send = (event) => {
    event.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setMessages((current) => [...current, ["user", text], ["assistant", replyFor(text)]]);
    setInput("");
  };

  return (
    <>
      <PageHeader
        eyebrow="AI Customer Care"
        title="Auction support assistant"
        copy="A local AI-mode support panel for common customer questions. It can later connect to a real AI API and your helpdesk tickets."
        action={supportAction}
      />
      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div className="glass rounded-[2rem] p-6">
          <Bot className="mb-5 text-gold" size={34} />
          <h2 className="font-display text-3xl font-black">AI mode coverage</h2>
          <div className="mt-5 space-y-3">
            {["Bidding guidance", "Payment and wallet help", "Admin approval status", "Camera proof support", "Seller upload instructions"].map((item) => (
              <div className="flex items-center gap-3 text-mist" key={item}>
                <MessageCircle className="text-green-success" size={18} />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="soft-card rounded-[2rem] p-6">
          <div className="mb-5 h-96 space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-4">
            {messages.map(([role, text], index) => (
              <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-6 ${role === "user" ? "ml-auto bg-blue-premium text-white" : "bg-midnight text-mist"}`} key={`${role}-${index}`}>
                {text}
              </div>
            ))}
          </div>
          <form onSubmit={send} className="flex gap-3">
            <input value={input} onChange={(event) => setInput(event.target.value)} className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 outline-none" placeholder="Ask about bidding, approval, camera, or wallet..." />
            <button className="premium-button px-4" aria-label="Send message"><Send size={18} /></button>
          </form>
        </div>
      </section>
    </>
  );
}

function FloatingAIHub({ route, role, auctions, pendingLots, rejectedLots }) {
  const historyKey = "primebid-react-ai-hub-history";
  const currentRole = normalizeRole(role);
  const lotMatch = route.match(/^lot-(.+)$/);
  const currentLot = lotMatch ? auctions.find((lot) => lot.id === lotMatch[1]) : null;
  const messagesRef = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(() => window.location.hash === "#support");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(historyKey) || "[]");
      if (Array.isArray(saved) && saved.length) return saved.slice(-12);
    } catch {
      return [];
    }
    return [
      {
        role: "assistant",
        text: "Hi, I am the PrimeBid AI Hub. I float on every screen and can help with auctions, bids, wallets, seller uploads, approvals, and admin questions."
      }
    ];
  });

  const includesAny = (value, words) => words.some((word) => value.includes(word));

  const describeContext = () => {
    if (currentLot) {
      return `Watching ${currentLot.title}: current bid ${formatKes(currentLot.bid)}, ${currentLot.bids} bids, ${currentLot.time} left.`;
    }
    if (route === "auctions") return `Watching ${auctions.length} live auction lots. I can help narrow choices, explain bidding, or open a specific lot.`;
    if (route === "vehicles") return "Watching vehicle auctions. I can help compare logbook checks, inspection proof, bid holds, and escrow steps.";
    if (route === "property") return "Watching property auctions. I can help with title checks, deposit flow, reserve progress, and document questions.";
    if (route === "sell") return "Watching the auctioneer upload flow. I can help submit goods, check camera proof, and explain admin approval.";
    if (route === "seller-lots") return "I can explain your pending review, live lots, rejected drafts, and next upload steps.";
    if (route === "payouts") return "I can explain settlement holds, payout methods, timing, and expected revenue from your auctions.";
    if (route === "admin") return `${pendingLots.length} auction(s) awaiting your approval. I can guide you through verification, moderation, and platform health.`;
    if (route === "wallet") return "I can explain wallet balances, bid holds, M-Pesa deposits, refunds, and how escrow protects your payments.";
    if (route === "dashboard") return currentRole === "auctioneer" ? "I can help you upload goods, track approvals, manage listings, and understand your payouts." : "I can explain your active bids, wins, watchlist activity, performance metrics, and real-time alerts.";
    if (route === "notifications") return "I can explain outbid alerts, wallet events, seller messages, admin warnings, and status updates.";
    if (["login", "register", "forgot-password", "otp-verification"].includes(route)) return "I can help with sign in, registration, OTP verification, password recovery, and account security.";
    if (currentRole === "admin") return "I can help with auction approvals, user management, payment monitoring, and platform controls.";
    if (currentRole === "auctioneer") return "I can help with uploading goods, tracking status, understanding approvals, and managing payouts.";
    return "Watching the PrimeBid marketplace. I can guide a bidder from discovery to bidding, payment, and watchlists.";
  };

  const replyFor = (text) => {
    const query = text.toLowerCase();
    const amount = Number(query.replace(/,/g, "").match(/\b\d+(\.\d+)?\b/)?.[0] || 0);

    if (includesAny(query, ["hi", "hello", "hey", "what's up", "yo", "sup"])) {
      return "Hey! 👋 I'm here to help you navigate PrimeBid. Ask me about bidding, auctions, payments, approvals, or anything else about the system—I've got you covered.";
    }

    if (includesAny(query, ["where am i", "this page", "what page", "what can you do", "help"])) {
      return describeContext();
    }

    if (includesAny(query, ["bid", "bidding", "auto", "proxy", "place", "reserve"])) {
      if (currentRole !== "auctionee") {
        return "Bidding is for buyers (Auctionees). Switch to the Auctionee role at login to place bids. This workspace keeps seller and admin work separate from customer bidding.";
      }
      if (currentLot) {
        if (amount && amount <= currentLot.bid) {
          return `For ${currentLot.title}, you'll need to bid above ${formatKes(currentLot.bid)} to compete. Proxy bidding lets you set a maximum and the system bids automatically for you.`;
        }
        if (amount && amount > currentLot.bid) {
          return `${formatKes(amount)} is above the current bid for ${currentLot.title}. Make sure you have enough wallet balance reserved and check how much time is left before confirming.`;
        }
        return `Current bid for ${currentLot.title} is ${formatKes(currentLot.bid)} with ${currentLot.time} left. You can bid manually once or use proxy bidding to automatically raise your bid up to a limit you set.`;
      }
      return "Open an auction lot first to see the current bid and reserve. Then choose: manual bid for a single raise, or proxy bidding to let the system protect you up to your maximum.";
    }

    if (includesAny(query, ["pay", "payment", "mpesa", "m-pesa", "wallet", "deposit", "refund", "escrow"])) {
      if (currentRole === "auctioneer") return "Seller payouts are in the Payouts section. Check your settlement holds, expected timing, and payout methods there.";
      if (currentRole === "admin") return "You can monitor payment health and escrow state from the Payments dashboard. Wallet holds are managed per bidder.";
      return "Fund your wallet via M-Pesa to place bid holds. When you bid, the amount is held; when you win, we finalize the payment. For expensive items, escrow protects both buyer and seller until verification is complete.";
    }

    if (includesAny(query, ["upload", "seller", "auctioneer", "camera", "proof", "approve", "approval"])) {
      if (currentRole === "auctionee") return "Selling is for Auctioneers. Switch to the Auctioneer role at login to upload goods and manage your listings.";
      if (currentRole === "admin") return `Review seller submissions in Auction Approvals. ${pendingLots.length} lot(s) pending: verify proof, documents, reserve, and condition before approving.`;
      return `Submit goods with reserve price, category, images, and camera proof. Admins verify everything before your auction goes live. ${pendingLots.length} lot(s) in the queue waiting.`;
    }

    if (includesAny(query, ["admin", "reject", "moderation", "user", "flag", "queue"])) {
      if (currentRole !== "admin") return "Admin controls are restricted to admins. Sign in with the Admin role at login to access approvals, users, payments, and platform settings.";
      return `Your approval queue: verify seller proof, documents, reserve, and condition. You can approve or reject. Go to Auction Approvals to review the ${pendingLots.length} pending lot(s).`;
    }

    if (includesAny(query, ["find", "search", "filter", "category", "vehicle", "property", "luxury", "electronics"])) {
      if (currentRole === "auctioneer") return "Use My Lots to search your submitted goods, check status, track drafts, and manage listings.";
      if (currentRole === "admin") return "Use the Admin search to find approvals, users, flagged listings, and risk alerts.";
      const examples = auctions.slice(0, 3).map((lot) => `${lot.title} at ${formatKes(lot.bid)}`).join("; ");
      return `Browse Auctions to see everything. Use filters for categories, search by title or lot ID, or jump to specific types. Right now: ${examples}.`;
    }

    if (includesAny(query, ["watch", "watchlist", "notification", "alert", "outbid"])) {
      return "Watchlists and notifications help users track lots without bidding immediately. Outbid, wallet, seller, and admin alerts should land in the notification center.";
    }

    if (includesAny(query, ["login", "register", "password", "otp", "supabase", "sign in", "account"])) {
      return "The auth system supports email/password login, registration by role, forgot-password recovery, OTP verification, social login buttons, validation, and Supabase calls when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are configured.";
    }

    return `Got it: "${text}". ${describeContext()} Ask me about bidding, wallet, approvals, uploads, searches, watchlists, or admin actions—I'll give you the details.`;
  };

  const suggestions = () => {
    if (currentLot) return ["Should I bid now?", "Explain proxy bidding", "What should I verify?"];
    if (route === "sell") return ["How do I upload goods?", "Check camera proof", "What happens after approval?"];
    if (route === "seller-lots") return ["What needs revision?", "What is pending?", "How do live lots work?"];
    if (route === "payouts") return ["Explain payout holds", "When do I get paid?", "What are seller fees?"];
    if (route === "admin") return ["What needs approval?", "How do I reject safely?", "Summarize admin work"];
    if (route === "wallet") return ["Explain balances", "What are bid holds?", "How do deposits work?"];
    if (["login", "register", "forgot-password", "otp-verification"].includes(route)) return ["Help me sign in", "Explain OTP", "Supabase setup"];
    if (currentRole === "admin") return ["What needs approval?", "Summarize risk alerts", "How do I reject safely?"];
    if (currentRole === "auctioneer") return ["Upload a lot", "Check my lots", "Explain payouts"];
    return ["Help me find an auction", "How do I place a bid?", "How does wallet payment work?"];
  };

  const sendPrompt = (value) => {
    const text = value.trim();
    if (!text) return;
    setMessages((current) => [
      ...current,
      { role: "user", text },
      { role: "assistant", text: replyFor(text) }
    ].slice(-14));
    setInput("");
  };

  const runAction = (action) => {
    if (action === "search") {
      const search = document.querySelector("input[placeholder*='Search']");
      if (search instanceof HTMLInputElement) {
        search.focus();
        setMessages((current) => [...current, { role: "assistant", text: "Search is focused. Type a lot title, seller, category, or lot ID." }].slice(-14));
      } else {
        sendPrompt("Help me find an auction");
      }
      return;
    }

    if (action === "auctions") window.location.hash = "auctions";
    if (action === "lot" && auctions[0]) window.location.hash = `lot-${auctions[0].id}`;
    if (action === "admin") window.location.hash = "admin";
    if (action === "wallet") window.location.hash = "wallet";
    if (action === "sell") window.location.hash = "sell";
    if (action === "seller-lots") window.location.hash = "seller-lots";
    if (action === "payouts") window.location.hash = "payouts";
    setOpen(true);
  };

  const quickActions = () => {
    if (currentRole === "admin") return [["admin", "Admin Control"], ["search", "Focus search"]];
    if (currentRole === "auctioneer") return [["sell", "Upload"], ["seller-lots", "My lots"], ["payouts", "Payouts"], ["search", "Focus search"]];
    return [["search", "Focus search"], ["auctions", "Auctions"], ["lot", "Open lot"], ["wallet", "Wallet"]];
  };

  useEffect(() => {
    localStorage.setItem(historyKey, JSON.stringify(messages.slice(-14)));
  }, [messages]);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    const openHub = () => setOpen(true);
    window.addEventListener("primebid-open-ai-hub", openHub);
    return () => window.removeEventListener("primebid-open-ai-hub", openHub);
  }, []);

  useEffect(() => {
    if (route === "support") setOpen(true);
  }, [route]);

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 right-4 z-[80] flex justify-end sm:left-auto sm:w-[25rem]">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        className={`pointer-events-auto inline-flex min-h-14 items-center gap-3 rounded-full border border-gold/40 bg-gradient-to-r from-gold to-green-success px-3 py-2 font-black text-slate-950 shadow-glow transition ${open ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"}`}
      >
        <span className="grid size-10 place-items-center rounded-full bg-midnight text-sm text-gold">AI</span>
        Ask Hub
      </button>

      <section className={`pointer-events-auto absolute bottom-0 right-0 grid max-h-[calc(100vh-2rem)] w-full grid-rows-[auto_auto_auto_auto_minmax(12rem,1fr)_auto] gap-3 overflow-hidden rounded-3xl border border-gold/25 bg-panel/95 p-4 shadow-glass backdrop-blur-2xl transition ${open ? "visible translate-y-0 scale-100 opacity-100" : "invisible translate-y-4 scale-95 opacity-0"}`} aria-label="Floating AI Hub">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-green-success"><Sparkles size={14} /> Floating AI Hub</div>
            <h2 className="font-display text-2xl font-black">How can I help?</h2>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-2xl border border-white/10 bg-white/5 text-mist hover:text-white" aria-label="Close AI Hub">
            <X size={18} />
          </button>
        </div>

        <p className="rounded-2xl border border-green-success/20 bg-green-success/10 p-3 text-sm leading-6 text-mist">{describeContext()}</p>

        <div className="flex flex-wrap gap-2">
          {suggestions().map((prompt) => (
            <button key={prompt} type="button" onClick={() => sendPrompt(prompt)} className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-snow hover:bg-white/15">
              {prompt}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {quickActions().map(([action, label]) => (
            <button key={action} type="button" onClick={() => runAction(action)} className="rounded-full border border-gold/20 bg-gold/10 px-3 py-2 text-xs font-black text-gold">
              {label}
            </button>
          ))}
        </div>

        <div ref={messagesRef} className="grid max-h-72 content-start gap-3 overflow-y-auto rounded-2xl border border-white/10 bg-midnight/70 p-3">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`max-w-[88%] rounded-2xl p-3 text-sm leading-6 ${message.role === "user" ? "ml-auto bg-gold text-slate-950 font-bold" : "border border-green-success/15 bg-green-success/10 text-mist"}`}>
              {message.text}
            </div>
          ))}
        </div>

        <form onSubmit={(event) => { event.preventDefault(); sendPrompt(input); }} className="grid grid-cols-[1fr_auto] gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="min-w-0 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-mist"
            placeholder="Ask about bids, wallet, approvals..."
          />
          <button className="premium-button px-4" aria-label="Send message"><Send size={18} /></button>
        </form>
      </section>
    </div>
  );
}

function ActivityFeed() {
  return (
    <div className="soft-card rounded-[2rem] p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-display text-2xl font-black">Live activity</h3>
        <Activity className="text-green-success" />
      </div>
      <div className="space-y-3">
        {activity.map(([title, text, time]) => (
          <motion.div initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-3xl border border-white/10 bg-white/5 p-4" key={text}>
            <div className="flex items-center justify-between">
              <strong>{title}</strong>
              <span className="text-xs font-bold text-gold">{time}</span>
            </div>
            <p className="mt-1 text-sm text-mist">{text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function NotificationsPage({ role }) {
  const currentRole = normalizeRole(role);
  const copy =
    currentRole === "admin"
      ? "Admin-only alerts for flagged listings, approval pressure, user health, and moderation signals."
      : currentRole === "auctioneer"
        ? "Seller alerts for approval outcomes, buyer messages, payout movement, and listing performance."
        : "Bidder alerts for outbid notices, winning updates, watchlist movement, and wallet events.";

  return (
    <>
      <PageHeader
        eyebrow="Notification Center"
        title={currentRole === "admin" ? "Risk alerts and moderation events" : currentRole === "auctioneer" ? "Seller alerts and payout events" : "Realtime alerts and bidder events"}
        copy={copy}
      />
      <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        <ActivityFeed />
      </section>
    </>
  );
}

function RoleAccessPage({ requiredRole, currentRole }) {
  const requiredLabel = roleLabels[normalizeRole(requiredRole)];
  const currentLabel = roleLabels[normalizeRole(currentRole)];

  return (
    <>
      <PageHeader
        eyebrow="Role Workspace"
        title={`${requiredLabel} access required`}
        copy={`You are currently browsing as ${currentLabel}. Sign in with the ${requiredLabel} role from the login screen to open this workspace.`}
        action={<a href="#login" className="premium-button"><LockKeyhole size={18} /> Choose Role</a>}
      />
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="soft-card rounded-[2rem] p-6">
          <ShieldAlert className="mb-5 text-gold" size={34} />
          <h2 className="font-display text-2xl font-black">Protected workspace</h2>
          <p className="mt-3 max-w-2xl leading-7 text-mist">
            You are signed in as {currentLabel}. To enter the {requiredLabel} workspace, sign in again using that role and the demo PIN. Role switching is handled through the secure login screen.
          </p>
        </div>
      </section>
    </>
  );
}

function RoleRedirectPage({ role }) {
  return (
    <PageHeader
      eyebrow="Workspace Boundary"
      title="Opening your authorized workspace"
      copy={`This session is signed in as ${roleLabels[normalizeRole(role)]}. PrimeBid keeps admin, seller, and bidder workspaces separated, so this route is being redirected to the correct area.`}
      action={<a href={`#${getRoleHomeRoute(role)}`} className="premium-button"><ShieldCheck size={18} /> Continue</a>}
    />
  );
}

function IntegrationStrip() {
  const integrations = [
    [PackageCheck, "Verified Lots", "Seller, ownership, document, and condition signals are clear before bidding."],
    [Activity, "Realtime Bidding", "Live bid rooms keep timers, bid counts, and reserve progress easy to follow."],
    [Bell, "Smart Alerts", "Outbid, watchlist, approval, and auction activity notifications keep users informed."]
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-4 lg:grid-cols-3">
        {integrations.map(([Icon, title, text]) => (
          <div className="glass rounded-3xl p-5" key={title}>
            <Icon className="mb-5 text-gold" />
            <h3 className="font-display text-xl font-black">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-mist">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function App() {
  const socketStatus = useSocketStatus();
  const route = useRoute();
  const [activeRole, setActiveRole] = useState(getStoredRole);
  const [isAuthenticated, setIsAuthenticated] = useState(getAuthStatus);
  const [approvedLots, setApprovedLots] = useState(() => loadStoredLots("primebid-approved-lots", initialAuctions));
  const [pendingLots, setPendingLots] = useState(() => loadStoredLots("primebid-pending-lots", initialPendingLots));
  const [rejectedLots, setRejectedLots] = useState(() => loadStoredLots("primebid-rejected-lots", []));
  const lotMatch = route.match(/^lot-(.+)$/);
  const visibleAuctions = approvedLots.filter((lot) => lot.status === "approved");
  const authModeByRoute = {
    login: "login",
    register: "register",
    "forgot-password": "forgot",
    "otp-verification": "otp"
  };
  const authMode = authModeByRoute[route];

  useEffect(() => {
    const syncRole = () => setActiveRole(getStoredRole());
    window.addEventListener("primebid-role-change", syncRole);
    window.addEventListener("storage", syncRole);
    return () => {
      window.removeEventListener("primebid-role-change", syncRole);
      window.removeEventListener("storage", syncRole);
    };
  }, []);

  useEffect(() => {
    const syncAuth = () => setIsAuthenticated(getAuthStatus());
    window.addEventListener(authChangedEvent, syncAuth);
    window.addEventListener("storage", syncAuth);
    return () => {
      window.removeEventListener(authChangedEvent, syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated && !authMode && route !== "login") {
      window.location.hash = "login";
    }
    if (isAuthenticated && !authMode && !canAccessRoute(activeRole, route)) {
      window.location.hash = getRoleHomeRoute(activeRole);
    }
  }, [activeRole, authMode, isAuthenticated, route]);

  useEffect(() => {
    localStorage.setItem("primebid-approved-lots", JSON.stringify(approvedLots));
  }, [approvedLots]);

  useEffect(() => {
    localStorage.setItem("primebid-pending-lots", JSON.stringify(pendingLots));
  }, [pendingLots]);

  useEffect(() => {
    localStorage.setItem("primebid-rejected-lots", JSON.stringify(rejectedLots));
  }, [rejectedLots]);

  const submitLot = (lot) => {
    setPendingLots((current) => [lot, ...current]);
    window.location.hash = "seller-lots";
  };

  const approveLot = (id) => {
    const lot = pendingLots.find((item) => item.id === id);
    if (!lot) return;
    setApprovedLots((approved) => [
      {
        ...lot,
        status: "approved",
        time: "18h 00m",
        approvalNote: "Approved by admin and published to marketplace."
      },
      ...approved
    ]);
    setPendingLots((current) => current.filter((item) => item.id !== id));
  };

  const rejectLot = (id) => {
    const lot = pendingLots.find((item) => item.id === id);
    if (!lot) return;
    setRejectedLots((rejected) => [{ ...lot, status: "rejected", approvalNote: "Rejected by admin." }, ...rejected]);
    setPendingLots((current) => current.filter((item) => item.id !== id));
  };

  if (authMode) {
    return (
      <div className="min-h-screen bg-midnight text-snow">
        <AuthPage mode={authMode} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-midnight text-snow">
        <AuthPage mode="login" />
      </div>
    );
  }

  if (!canAccessRoute(activeRole, route)) {
    return (
      <div className="min-h-screen overflow-hidden bg-midnight text-snow">
        <Navbar route={route} role={activeRole} />
        <RoleRedirectPage role={activeRole} />
      </div>
    );
  }

  let page;
  if (lotMatch) page = <LotPage lotId={lotMatch[1]} auctions={visibleAuctions} />;
  else if (route === "auctions") page = <AuctionsPage auctions={visibleAuctions} />;
  else if (route === "sell") page = <AuctioneerUploadPage onSubmitLot={submitLot} />;
  else if (route === "seller-lots") page = <SellerLotsPage pendingLots={pendingLots} approvedLots={visibleAuctions} rejectedLots={rejectedLots} />;
  else if (route === "payouts") page = <SellerPayoutsPage />;
  else if (route === "vehicles") page = <AssetPage type="Vehicles" auctions={visibleAuctions} />;
  else if (route === "property") page = <AssetPage type="Property" auctions={visibleAuctions} />;
  else if (route === "dashboard") page = <DashboardPage role={activeRole} pendingLots={pendingLots} approvedLots={visibleAuctions} rejectedLots={rejectedLots} />;
  else if (route === "admin") page = <AdminPage pendingLots={pendingLots} approvedLots={visibleAuctions} rejectedLots={rejectedLots} onApproveLot={approveLot} onRejectLot={rejectLot} />;
  else if (route === "wallet") page = <WalletPage />;
  else if (route === "notifications") page = <NotificationsPage role={activeRole} />;
  else if (route === "support") page = <SupportPage role={activeRole} />;
  else page = <HomePage socketStatus={socketStatus} auctions={visibleAuctions} />;

  return (
    <div className="min-h-screen overflow-hidden bg-midnight text-snow">
      <Navbar route={route} role={activeRole} />
      {page}
      <FloatingAIHub route={route} role={activeRole} auctions={visibleAuctions} pendingLots={pendingLots} rejectedLots={rejectedLots} />
    </div>
  );
}

export default App;
