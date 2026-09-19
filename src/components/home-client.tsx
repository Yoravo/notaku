"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFAQ } from "@/components/landing-faq";
import { LandingFooter } from "@/components/layout/landing-footer";
import { useTranslations } from "next-intl";
import { formatMoney } from "@/lib/currencies";
import { APP_VERSION } from "@/lib/changelog";
import {
  CheckIcon,
  ChatBubbleLeftRightIcon,
  ArrowDownTrayIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  BoltIcon,
  CalculatorIcon,
  PencilSquareIcon,
  BuildingStorefrontIcon,
  DocumentTextIcon,
  DocumentCheckIcon,
  TruckIcon,
  LanguageIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

interface HomeClientProps {
  session: any;
  announcementBanner: React.ReactNode;
}

export function HomeClient({ session, announcementBanner }: HomeClientProps) {
  const tHero = useTranslations("hero");
  const tMockup = useTranslations("mockup");
  const tFeatures = useTranslations("featuresSection");
  const tWorkflow = useTranslations("workflow");
  const tPricing = useTranslations("pricing");
  const tBottomCta = useTranslations("bottomCta");
  const tNav = useTranslations("nav");
  const tTools = useTranslations("tools");

  // 3D Card Interactive Tilt & Physics State
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const secondaryCardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const [isPaid, setIsPaid] = useState(true);
  const [showCopied, setShowCopied] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const isTouchDeviceRef = useRef(false);

  // Physics constants & mutable state (no React re-renders during motion)
  const RESTING = {
    rx: 5.5,
    ry: -8.5,
    rz: 1.2,
    tz: 0,
    scale: 1,
    gx: 50,
    gy: 50,
    go: 0,
  };

  const target = useRef({ ...RESTING });
  const current = useRef({ ...RESTING });
  const isHoveredRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  // Detect pointer capability & reduced motion dynamically
  useEffect(() => {
    const finePointerMq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotionMq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateCapabilities = () => {
      const isTouch = !finePointerMq.matches || reducedMotionMq.matches;
      isTouchDeviceRef.current = isTouch;
      setIsTouchDevice(isTouch);

      if (isTouch) {
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        isAnimatingRef.current = false;
        if (cardRef.current) {
          cardRef.current.style.transform = "";
        }
      } else {
        if (cardRef.current) {
          cardRef.current.style.transform = `perspective(1000px) rotateX(${RESTING.rx}deg) rotateY(${RESTING.ry}deg) rotateZ(${RESTING.rz}deg) translateZ(${RESTING.tz}px) scale(${RESTING.scale})`;
        }
      }
    };

    updateCapabilities();

    finePointerMq.addEventListener("change", updateCapabilities);
    reducedMotionMq.addEventListener("change", updateCapabilities);

    return () => {
      finePointerMq.removeEventListener("change", updateCapabilities);
      reducedMotionMq.removeEventListener("change", updateCapabilities);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, []);

  const tick = useCallback(() => {
    const LERP = 0.08;
    const cur = current.current;
    const tar = target.current;

    cur.rx += (tar.rx - cur.rx) * LERP;
    cur.ry += (tar.ry - cur.ry) * LERP;
    cur.rz += (tar.rz - cur.rz) * LERP;
    cur.tz += (tar.tz - cur.tz) * LERP;
    cur.scale += (tar.scale - cur.scale) * LERP;
    cur.gx += (tar.gx - cur.gx) * 0.1;
    cur.gy += (tar.gy - cur.gy) * 0.1;
    cur.go += (tar.go - cur.go) * 0.12;

    // Direct DOM transform updates (zero VDOM overhead)
    if (cardRef.current) {
      cardRef.current.style.transform = `perspective(1000px) rotateX(${cur.rx.toFixed(2)}deg) rotateY(${cur.ry.toFixed(2)}deg) rotateZ(${cur.rz.toFixed(2)}deg) translateZ(${cur.tz.toFixed(1)}px) scale(${cur.scale.toFixed(3)})`;
    }

    if (secondaryCardRef.current) {
      const secRx = (cur.rx * 0.45).toFixed(2);
      const secRy = (cur.ry * 0.45).toFixed(2);
      const secTx = (18 - cur.ry * 0.4).toFixed(1);
      const secTy = (-12 + cur.rx * 0.3).toFixed(1);
      secondaryCardRef.current.style.transform = `perspective(1000px) rotateX(${secRx}deg) rotateY(${secRy}deg) translate3d(${secTx}px, ${secTy}px, -40px)`;
    }

    if (glareRef.current) {
      glareRef.current.style.opacity = cur.go.toFixed(3);
      glareRef.current.style.background = `radial-gradient(circle at ${cur.gx.toFixed(1)}% ${cur.gy.toFixed(1)}%, rgba(255, 255, 255, 0.22) 0%, transparent 60%)`;
    }

    // Convergence threshold to sleep rAF loop when settled (0% CPU when stationary)
    const delta =
      Math.abs(tar.rx - cur.rx) +
      Math.abs(tar.ry - cur.ry) +
      Math.abs(tar.scale - cur.scale) +
      Math.abs(tar.go - cur.go);

    if (delta > 0.005) {
      rafIdRef.current = requestAnimationFrame(tick);
    } else {
      // Settle precisely to target state and sleep
      cur.rx = tar.rx;
      cur.ry = tar.ry;
      cur.rz = tar.rz;
      cur.tz = tar.tz;
      cur.scale = tar.scale;
      cur.go = tar.go;
      cur.gx = tar.gx;
      cur.gy = tar.gy;

      if (cardRef.current) {
        cardRef.current.style.transform = `perspective(1000px) rotateX(${cur.rx.toFixed(2)}deg) rotateY(${cur.ry.toFixed(2)}deg) rotateZ(${cur.rz.toFixed(2)}deg) translateZ(${cur.tz.toFixed(1)}px) scale(${cur.scale.toFixed(3)})`;
      }
      if (glareRef.current) {
        glareRef.current.style.opacity = cur.go.toFixed(3);
      }

      isAnimatingRef.current = false;
      rafIdRef.current = null;
    }
  }, []);

  const startAnimation = useCallback(() => {
    if (!isAnimatingRef.current) {
      isAnimatingRef.current = true;
      rafIdRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  const updateTargetFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      if (isTouchDeviceRef.current || !cardContainerRef.current) return;
      const rect = cardContainerRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const normX = Math.max(-1, Math.min(1, (x - centerX) / centerX));
      const normY = Math.max(-1, Math.min(1, (y - centerY) / centerY));

      // Bounded rotation (max 8.5 deg for natural elegant perspective)
      target.current.rx = -normY * 8.5;
      target.current.ry = normX * 8.5;
      target.current.rz = normX * 0.5;
      target.current.tz = 8;
      target.current.scale = 1.015;

      target.current.gx = (x / rect.width) * 100;
      target.current.gy = (y / rect.height) * 100;
      target.current.go = 0.22;

      isHoveredRef.current = true;
      startAnimation();
    },
    [startAnimation]
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      updateTargetFromPointer(e.clientX, e.clientY);
    },
    [updateTargetFromPointer]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      updateTargetFromPointer(e.clientX, e.clientY);
    },
    [updateTargetFromPointer]
  );

  const handleMouseLeave = useCallback(() => {
    if (isTouchDeviceRef.current) return;
    target.current.rx = RESTING.rx;
    target.current.ry = RESTING.ry;
    target.current.rz = RESTING.rz;
    target.current.tz = RESTING.tz;
    target.current.scale = RESTING.scale;
    target.current.go = 0;

    isHoveredRef.current = false;
    startAnimation();
  }, [startAnimation]);

  const mainFeatures = [
    {
      icon: BoltIcon,
      title: tFeatures("f1_title"),
      desc: tFeatures("f1_desc"),
      badge: tFeatures("f1_badge"),
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: tFeatures("f2_title"),
      desc: tFeatures("f2_desc"),
      badge: tFeatures("f2_badge"),
    },
    {
      icon: ArrowDownTrayIcon,
      title: tFeatures("f3_title"),
      desc: tFeatures("f3_desc"),
      badge: tFeatures("f3_badge"),
    },
    {
      icon: CalculatorIcon,
      title: tFeatures("f4_title"),
      desc: tFeatures("f4_desc"),
      badge: tFeatures("f4_badge"),
    },
    {
      icon: PencilSquareIcon,
      title: tFeatures("f5_title"),
      desc: tFeatures("f5_desc"),
      badge: tFeatures("f5_badge"),
    },
    {
      icon: UserGroupIcon,
      title: tFeatures("f6_title"),
      desc: tFeatures("f6_desc"),
      badge: tFeatures("f6_badge"),
    },
  ];

  const workflowSteps = [
    {
      step: tWorkflow("s1_step"),
      title: tWorkflow("s1_title"),
      desc: tWorkflow("s1_desc"),
    },
    {
      step: tWorkflow("s2_step"),
      title: tWorkflow("s2_title"),
      desc: tWorkflow("s2_desc"),
    },
    {
      step: tWorkflow("s3_step"),
      title: tWorkflow("s3_title"),
      desc: tWorkflow("s3_desc"),
    },
  ];

  return (
    <div className="grain min-h-screen bg-paper text-ink flex flex-col selection:bg-emerald/20 selection:text-emerald-900">
      {/* Global Broadcast Announcement Banner for Landing Page */}
      {announcementBanner}

      {/* Sticky Header Navigation */}
      <LandingNavbar session={session} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-20 sm:pt-20 sm:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="rise flex flex-wrap items-center gap-2.5">
                <Link
                  href="/changelog"
                  prefetch={true}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/80 dark:bg-emerald-950/50 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/60 px-3.5 py-1.5 text-xs font-semibold text-[#0f6b4f] dark:text-emerald-400 transition-all group shadow-2xs"
                  title="Lihat catatan rilis versi terbaru"
                >
                  <span className="px-1.5 py-0.5 rounded-full font-mono font-bold text-[10px] bg-emerald-600 dark:bg-emerald-500 text-white">
                    v{APP_VERSION}
                  </span>
                  <span>{tHero("badge")} · {tNav("changelog")}</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              <h1
                className="rise font-sans text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-6xl text-ink"
                style={{ animationDelay: "0.1s" }}
              >
                {tHero("title")}{" "}
                <span className="text-emerald dark:text-emerald-400">{tHero("titleHighlight")}</span>
              </h1>

              <p
                className="rise max-w-xl text-base sm:text-lg leading-relaxed text-ink-soft font-normal"
                style={{ animationDelay: "0.2s" }}
              >
                {tHero("desc")}
              </p>

              {/* Action Buttons */}
              <div
                className="rise flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2"
                style={{ animationDelay: "0.3s" }}
              >
                <Link
                  href={session ? "/dashboard" : "/register"}
                  prefetch={true}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f6b4f] hover:bg-[#0c553e] px-7 py-3.5 text-sm sm:text-base font-bold text-white shadow-sm transition-all active:scale-[0.98] min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2"
                >
                  <span>{session ? tHero("ctaDashboard") : tHero("ctaStart")}</span>
                </Link>

                <Link
                  href="/buat-invoice"
                  prefetch={true}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-paper-deep hover:bg-line text-ink dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-white px-6 py-3.5 text-sm sm:text-base font-bold transition-colors min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2"
                >
                  <DocumentTextIcon className="w-4 h-4 text-emerald" />
                  <span>{tTools("tryFreeGenerator")}</span>
                </Link>

                <a
                  href="/#cara-kerja"
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById("cara-kerja");
                    if (el) {
                      const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
                      window.scrollTo({ top: y, behavior: "smooth" });
                    }
                    window.history.pushState(null, "", "/#cara-kerja");
                  }}
                  className="inline-flex items-center justify-center px-4 py-3 text-sm font-semibold text-ink-soft hover:text-emerald transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded-lg text-center cursor-pointer"
                >
                  {tHero("ctaHow")} &rarr;
                </a>
              </div>

              {/* Trust Badges */}
              <div
                className="rise flex flex-wrap items-center gap-y-2 gap-x-6 pt-3 text-xs sm:text-sm text-ink-soft font-medium"
                style={{ animationDelay: "0.4s" }}
              >
                <span className="inline-flex items-center gap-1.5">
                  <CheckIcon className="w-4 h-4 text-emerald stroke-[2.5]" />
                  {tHero("trust1")}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckIcon className="w-4 h-4 text-emerald stroke-[2.5]" />
                  {tHero("trust2")}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckIcon className="w-4 h-4 text-emerald stroke-[2.5]" />
                  {tHero("trust3")}
                </span>
              </div>
            </div>

            {/* Right Interactive Mockup / 3D Document Stage */}
            <div
              ref={cardContainerRef}
              onMouseEnter={handleMouseEnter}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="lg:col-span-5 relative flex items-center justify-center py-6 sm:py-8 select-none touch-pan-y group/hero-stage"
            >
              {/* Grounded Natural Floor Shadows */}
              <div
                className="absolute -bottom-6 inset-x-8 sm:inset-x-12 h-10 rounded-[100%] bg-slate-900/[0.07] dark:bg-black/50 blur-2xl pointer-events-none -z-10"
              />
              <div
                className="absolute -bottom-2 inset-x-14 sm:inset-x-20 h-4 rounded-[100%] bg-slate-950/[0.04] dark:bg-black/40 blur-md pointer-events-none -z-10"
              />

              {/* Atmospheric Ambient Emerald/Teal Glow */}
              <div
                className="absolute -inset-6 rounded-3xl bg-gradient-to-tr from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl opacity-50 dark:opacity-25 pointer-events-none -z-20"
              />

              {/* Secondary Stacked Paper Card for Layered 3D Depth */}
              <div
                ref={secondaryCardRef}
                className="absolute w-full max-w-md h-full rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-paper-deep/50 dark:bg-slate-800/30 pointer-events-none hidden sm:block will-change-transform shadow-[0_12px_28px_-10px_rgba(15,23,42,0.06),0_0_0_1px_rgba(15,23,42,0.04)] dark:shadow-[0_16px_36px_-12px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)]"
                style={{
                  transform: "perspective(1000px) rotateX(2.48deg) rotateY(-3.83deg) translate3d(21.4px, -10.4px, -40px)",
                }}
              />

              {/* Main Futuristic 3D Document Card with Butter-Smooth Inertia & Soft Modern Shadow */}
              <div
                ref={cardRef}
                className={`relative mx-auto w-full max-w-md rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-slate-900/95 p-6 sm:p-7 group will-change-transform shadow-[0_2px_4px_rgba(15,23,42,0.02),0_12px_24px_-6px_rgba(15,23,42,0.06),0_24px_48px_-12px_rgba(15,23,42,0.08),0_0_0_1px_rgba(15,23,42,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3),0_16px_32px_-8px_rgba(0,0,0,0.5),0_32px_64px_-16px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_0_0_rgba(255,255,255,0.08)] ${
                  isTouchDevice ? "animate-float-gentle" : ""
                }`}
                style={{
                  transform: !isTouchDevice
                    ? `perspective(1000px) rotateX(${RESTING.rx}deg) rotateY(${RESTING.ry}deg) rotateZ(${RESTING.rz}deg) translateZ(${RESTING.tz}px) scale(${RESTING.scale})`
                    : undefined,
                  transformStyle: "preserve-3d",
                  WebkitTransformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                {/* Dynamic Specular Glare Layer that follows mouse pointer */}
                <div
                  ref={glareRef}
                  className="absolute inset-0 rounded-2xl pointer-events-none z-30 opacity-0"
                />

                {/* Header Mockup with Parallax Layer Z: 20px */}
                <div
                  className="flex items-start justify-between border-b border-line dark:border-slate-800 pb-4"
                  style={{ transform: "translateZ(20px)" }}
                >
                  <div>
                    <Link
                      href="/"
                      prefetch={true}
                      className="flex items-center gap-1.5 font-sans text-lg font-bold text-ink transition-opacity hover:opacity-80"
                    >
                      <Image
                        src="/logo.png"
                        alt="NotaKu Logo"
                        width={24}
                        height={24}
                        className="w-6 h-6 object-contain shrink-0"
                      />
                      <span>
                        <span>Nota</span>
                        <span className="text-emerald">Ku</span>
                      </span>
                    </Link>
                    <p className="font-mono text-[10px] text-ink-soft mt-0.5 tracking-wider">
                      #INV/2026/08/0029
                    </p>
                  </div>

                  {/* Interactive Status Badge with Parallax Layer Z: 36px */}
                  <button
                    type="button"
                    onClick={() => setIsPaid(!isPaid)}
                    style={{ transform: "translateZ(36px)" }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-1 rounded-full text-xs font-bold shadow-xs cursor-pointer transition-colors duration-150 min-h-[44px] sm:min-h-0 ${
                      isPaid
                        ? "bg-emerald-50 text-[#0f6b4f] dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/40"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40"
                    }`}
                    title="Klik untuk simulasi status pembayaran"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isPaid ? "bg-emerald animate-pulse" : "bg-amber-500"
                      }`}
                    />
                    <span>{isPaid ? tMockup("paid") : "BELUM LUNAS"}</span>
                  </button>
                </div>

                {/* Customer Info with Parallax Layer Z: 22px */}
                <div
                  className="mt-4 flex justify-between text-xs"
                  style={{ transform: "translateZ(22px)" }}
                >
                  <div>
                    <span className="text-ink-soft font-medium">{tMockup("billedTo")}</span>
                    <p className="font-bold text-ink text-sm mt-0.5">
                      Kopi Kenangan Senja
                    </p>
                    <p className="text-ink-soft text-[11px]">Jakarta Selatan</p>
                  </div>
                  <div className="text-right">
                    <span className="text-ink-soft font-medium">{tMockup("dueDate")}</span>
                    <p className="font-bold text-ink mt-0.5">28 Agu 2026</p>
                    <span className="inline-block text-[10px] font-semibold text-[#0f6b4f] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md mt-0.5">
                      Mayar QRIS
                    </span>
                  </div>
                </div>

                {/* Line Items with Parallax Layer Z: 26px */}
                <div
                  className="mt-5 space-y-2.5 rounded-xl bg-paper-deep/50 dark:bg-slate-800/60 p-3.5 text-xs border border-line/40 dark:border-slate-800"
                  style={{ transform: "translateZ(26px)" }}
                >
                  <div className="flex justify-between font-medium">
                    <span className="text-ink">{tMockup("item1")}</span>
                    <span className="tnum font-bold text-ink">Rp450.000</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-ink">{tMockup("item2")}</span>
                    <span className="tnum font-bold text-ink">Rp250.000</span>
                  </div>
                  <div className="flex justify-between text-ink-soft pt-1.5 border-t border-line/60 dark:border-slate-700">
                    <span>{tMockup("subtotal")}</span>
                    <span className="tnum font-medium">Rp700.000</span>
                  </div>
                  <div className="flex justify-between text-[#0f6b4f] dark:text-emerald-400 font-medium">
                    <span>{tMockup("discount")}</span>
                    <span className="tnum font-bold">-Rp70.000</span>
                  </div>
                  <div className="flex justify-between text-ink-soft">
                    <span>{tMockup("ppn")}</span>
                    <span className="tnum font-medium">Rp69.300</span>
                  </div>
                </div>

                {/* Grand Total with Parallax Layer Z: 42px */}
                <div
                  className="mt-4 flex items-baseline justify-between border-t border-ink/80 dark:border-slate-700 pt-3"
                  style={{ transform: "translateZ(42px)" }}
                >
                  <div>
                    <span className="text-xs font-bold text-ink-soft uppercase tracking-wider">
                      {tMockup("grandTotal")}
                    </span>
                  </div>
                  <span className="tnum font-sans text-2xl sm:text-3xl font-black text-ink tracking-tight">
                    Rp699.300
                  </span>
                </div>

                {/* Settlement Confirmation Strip with Parallax Layer Z: 22px */}
                <div
                  className="mt-4 flex items-center justify-between pt-2 border-t border-line/60 dark:border-slate-800 text-[11px] text-ink-soft font-medium"
                  style={{ transform: "translateZ(22px)" }}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheckIcon
                      className={`w-4 h-4 ${isPaid ? "text-emerald" : "text-amber-500"}`}
                    />
                    <span>{isPaid ? tMockup("verified") : "Menunggu Pelunasan"}</span>
                  </span>
                  <span
                    className={`font-semibold ${
                      isPaid ? "text-emerald dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {isPaid ? tMockup("qrisPaid") : "QRIS Mayar Otomatis"}
                  </span>
                </div>

                {/* Floating Interactive 3D Action Badge with Parallax Layer Z: 48px */}
                <button
                  type="button"
                  onClick={() => {
                    setShowCopied(true);
                    setTimeout(() => setShowCopied(false), 2200);
                  }}
                  style={{ transform: "translateZ(48px)" }}
                  className="absolute -bottom-3.5 right-2 sm:-right-4 rounded-xl border border-emerald-500/40 bg-white/95 dark:bg-slate-800/95 text-[#0f6b4f] dark:text-emerald-300 px-3.5 py-2 shadow-lg flex items-center gap-2 text-xs font-bold transition-colors duration-150 hover:bg-emerald-50 dark:hover:bg-slate-700/90 cursor-pointer group/wa min-h-[44px] sm:min-h-[36px]"
                  title="Klik untuk simulasi kirim nota WhatsApp"
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4 text-emerald group-hover/wa:rotate-12 transition-transform duration-200" />
                  <span>{showCopied ? "Link Nota Terkirim! ✓" : tMockup("floatCard")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="fitur" className="border-y border-line bg-paper-deep/60 dark:bg-slate-900/40 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald">
              {tFeatures("tag")}
            </span>
            <h2 className="mt-2 font-sans text-3xl font-extrabold tracking-tight sm:text-4xl text-ink">
              {tFeatures("title")}
            </h2>
            <p className="mt-3 text-base text-ink-soft">
              {tFeatures("desc")}
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mainFeatures.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="group relative rounded-2xl border border-line bg-white dark:bg-slate-900 p-7 shadow-xs transition-colors hover:border-emerald/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald/10 text-emerald transition-colors group-hover:bg-emerald group-hover:text-white">
                      <IconComp className="h-6 w-6 stroke-[2]" />
                    </div>
                    <span className="rounded-lg bg-paper-deep dark:bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-ink-soft">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="mt-5 font-sans text-lg font-bold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works / Workflow */}
      <section id="cara-kerja" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald">
              {tWorkflow("tag")}
            </span>
            <h2 className="mt-2 font-sans text-3xl font-extrabold tracking-tight sm:text-4xl text-ink">
              {tWorkflow("title")}
            </h2>
            <p className="mt-3 text-base text-ink-soft">
              {tWorkflow("desc")}
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {workflowSteps.map((step, idx) => (
              <div
                key={idx}
                className="relative rounded-2xl border border-line bg-paper-deep/40 dark:bg-slate-900/60 p-7 sm:p-8 text-left transition-colors hover:bg-paper-deep/80 dark:hover:bg-slate-900"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald text-white font-mono text-sm font-bold shadow-xs">
                  {step.step}
                </div>
                <h3 className="mt-5 font-sans text-lg sm:text-xl font-bold text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Business Tools & Calculators Showcase */}
      <section id="tools" className="border-t border-line bg-paper py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald">
                {tTools("badgeFreeNoLogin")}
              </span>
              <h2 className="mt-2 font-sans text-3xl font-extrabold tracking-tight sm:text-4xl text-ink">
                {tTools("showcaseTitle")}
              </h2>
              <p className="mt-3 text-base text-ink-soft">
                {tTools("showcaseDesc")}
              </p>
            </div>
            <Link
              href="/tools"
              prefetch={true}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald hover:text-emerald-bright transition-colors min-h-[44px] py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded-lg"
            >
              <span>{tTools("viewAllTools")}</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                title: "Invoice Generator Gratis",
                desc: "Buat faktur tagihan bisnis online dalam 30 detik tanpa daftar, hitung PPN otomatis, dan download PDF.",
                href: "/buat-invoice",
                icon: DocumentTextIcon,
                badge: "Populer",
              },
              {
                title: "Kuitansi Pembayaran Online",
                desc: "Generator tanda terima sah dengan ejaan terbilang rupiah otomatis, stempel lunas, dan ekspor PDF resmi.",
                href: "/buat-kuitansi",
                icon: DocumentCheckIcon,
                badge: "Baru",
              },
              {
                title: "Surat Jalan (Delivery Order)",
                desc: "Dokumen pengiriman barang standar ekspedisi logistik dengan rincian barang dan 3 kolom tanda tangan.",
                href: "/buat-surat-jalan",
                icon: TruckIcon,
                badge: "Baru",
              },
              {
                title: "Kalkulator PPN 11% / 12%",
                desc: "Hitung nilai Dasar Pengenaan Pajak (DPP) serta PPN sistem include maupun exclude harga secara akurat.",
                href: "/kalkulator-ppn",
                icon: CalculatorIcon,
              },
              {
                title: "Kalkulator PPh 23 Jasa",
                desc: "Kalkulasi potongan pajak PPh 23 (2% NPWP / 4% Non-NPWP) dan nilai kas bersih yang diterima vendor.",
                href: "/kalkulator-pph23",
                icon: CalculatorIcon,
                badge: "Baru",
              },
              {
                title: "Konverter Terbilang Rupiah",
                desc: "Ubah angka nominal uang menjadi kalimat ejaan huruf rupiah standar formal perbankan dan kuitansi.",
                href: "/terbilang-rupiah",
                icon: LanguageIcon,
              },
            ].map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  prefetch={true}
                  className="group relative p-6 rounded-2xl border border-line bg-paper-deep/30 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 hover:border-emerald/40 hover:shadow-md transition-all flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 rounded-xl bg-emerald/10 text-emerald group-hover:bg-emerald group-hover:text-white transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      {tool.badge && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald/10 text-emerald border border-emerald/20">
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-ink group-hover:text-emerald transition-colors">
                      {tool.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-ink-soft leading-relaxed line-clamp-2">
                      {tool.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-line/60 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald min-h-[44px] sm:min-h-[36px]">
                    <span>{tTools("useNow")}</span>
                    <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="border-t border-line bg-paper-deep/60 dark:bg-slate-900/40 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald">
              {tPricing("tag")}
            </span>
            <h2 className="mt-2 font-sans text-3xl font-extrabold tracking-tight sm:text-4xl text-ink">
              {tPricing("title")}
            </h2>
            <p className="mt-3 text-base text-ink-soft">
              {tPricing("desc")}
            </p>
          </div>

          <div className="mt-14 max-w-5xl mx-auto grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Free Plan */}
            <div className="flex flex-col justify-between rounded-2xl border border-line bg-white dark:bg-slate-900 p-8 sm:p-10 shadow-xs">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-sans text-2xl font-bold text-ink">{tPricing("freeTitle")}</h3>
                  <span className="rounded-lg bg-paper-deep dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-ink-soft">
                    {tPricing("freeBadge")}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink-soft">
                  {tPricing("freeDesc")}
                </p>
                <div className="mt-6 border-b border-line dark:border-slate-800 pb-6">
                  <p className="tnum font-sans text-4xl font-black text-ink tracking-tight">
                    {formatMoney(0, "IDR")}
                    <span className="text-sm font-normal text-ink-soft ml-1">
                      {tPricing("freePeriod")}
                    </span>
                  </p>
                </div>

                <ul className="mt-6 space-y-3.5 text-sm text-ink-soft">
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald/10 text-emerald shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>{tPricing("freeItem1")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald/10 text-emerald shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>{tPricing("freeItem2")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald/10 text-emerald shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>{tPricing("freeItem3")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald/10 text-emerald shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>{tPricing("freeItem4")}</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4">
                <Link
                  href={session ? "/dashboard" : "/register"}
                  prefetch={true}
                  className="flex items-center justify-center w-full rounded-xl bg-ink text-paper hover:bg-emerald hover:text-white py-3.5 text-sm font-bold transition-all cursor-pointer min-h-[48px] shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald"
                >
                  {session ? tPricing("freeBtnUser") : tPricing("freeBtnGuest")}
                </Link>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="relative flex flex-col justify-between rounded-2xl bg-[#09110E] dark:bg-slate-900 border border-emerald/30 p-8 sm:p-10 text-slate-100 shadow-xl shadow-emerald-950/20">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-sans text-2xl font-bold text-white">
                    Nota<span className="text-emerald-400">Ku</span> PRO
                  </h3>
                  <span className="rounded-lg bg-emerald px-2.5 py-1 text-xs font-bold text-white shadow-2xs">
                    {tPricing("proBadge")}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-300">
                  {tPricing("proDesc")}
                </p>
                <div className="mt-6 border-b border-white/15 pb-6">
                  <p className="tnum font-sans text-4xl font-black text-white tracking-tight">
                    {formatMoney(49000, "IDR")}
                    <span className="text-sm font-normal opacity-70 ml-1">
                      {tPricing("proPeriod")}
                    </span>
                  </p>
                  <p className="text-[11px] text-emerald-400 font-medium mt-1">
                    {tPricing("proPaymentNote")}
                  </p>
                </div>

                <ul className="mt-6 space-y-3.5 text-sm text-slate-200">
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald text-white shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>{tPricing("proItem1")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald text-white shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>{tPricing("proItem2")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald text-white shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>{tPricing("proItem3")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald text-white shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>{tPricing("proItem4")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald text-white shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>{tPricing("proItem5")}</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4">
                <Link
                  href={session ? "/dashboard" : "/register"}
                  prefetch={true}
                  className="flex items-center justify-center w-full rounded-xl bg-emerald hover:bg-emerald-bright py-3.5 text-sm font-bold text-white transition-colors cursor-pointer min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2"
                >
                  {session ? tPricing("proBtnUser") : tPricing("proBtnGuest")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <LandingFAQ />

      {/* Bottom CTA Banner */}
      <section className="border-t border-line bg-paper-deep/60 dark:bg-slate-900/40 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald/10 text-emerald mb-6">
              <BuildingStorefrontIcon className="h-6 w-6" />
            </div>
            <h2 className="font-sans text-3xl font-extrabold leading-tight sm:text-5xl text-ink tracking-tight">
              {tBottomCta("title")}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-ink-soft max-w-xl mx-auto">
              {tBottomCta("desc")}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={session ? "/dashboard" : "/register"}
                prefetch={true}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f6b4f] hover:bg-[#0c553e] px-9 py-4 text-sm sm:text-base font-bold text-white shadow-sm transition-all active:scale-[0.98] min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2"
              >
                <span>{session ? tBottomCta("ctaUser") : tBottomCta("ctaGuest")}</span>
              </Link>
            </div>
            <p className="mt-4 text-xs text-ink-soft font-medium">
              {tBottomCta("note")}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
