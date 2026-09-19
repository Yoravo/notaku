"use client";

import { useEffect, useRef, useState } from "react";
import {
  XMarkIcon,
  ArrowPathIcon,
  CheckIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
}

export function SignaturePadModal({
  isOpen,
  onClose,
  onSave,
}: SignaturePadModalProps) {
  const tSig = useTranslations("signaturePad");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [strokeColor, setStrokeColor] = useState<"#111827" | "#1e3a8a">("#111827");
  const [strokeWidth, setStrokeWidth] = useState<number>(2.5);

  useEffect(() => {
    if (!isOpen) return;

    // Inisialisasi kanvas saat modal terbuka
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI display agar garis tajam
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    ctx.scale(ratio, ratio);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
  }, [isOpen, strokeColor, strokeWidth]);

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    setIsEmpty(false);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;

    // Potong area bounding box gambar jika memungkinkan atau langsung export PNG transparan
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#0f6b4f] dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
              <PencilSquareIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {tSig("title")}
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {tSig("subtitle")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-slate-200 transition-colors cursor-pointer min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Pengaturan Coretan */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-gray-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-gray-200/70 dark:border-slate-700">
          {/* Warna Tinta */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-600 dark:text-slate-300">{tSig("inkColor")}</span>
            <button
              type="button"
              onClick={() => setStrokeColor("#111827")}
              className={`w-6 h-6 rounded-full bg-gray-900 cursor-pointer border-2 transition-transform ${
                strokeColor === "#111827"
                  ? "border-[#0f6b4f] scale-110 shadow-xs"
                  : "border-transparent opacity-80"
              }`}
              title={tSig("colorBlack")}
            />
            <button
              type="button"
              onClick={() => setStrokeColor("#1e3a8a")}
              className={`w-6 h-6 rounded-full bg-blue-900 cursor-pointer border-2 transition-transform ${
                strokeColor === "#1e3a8a"
                  ? "border-[#0f6b4f] scale-110 shadow-xs"
                  : "border-transparent opacity-80"
              }`}
              title={tSig("colorBlue")}
            />
          </div>

          {/* Ketebalan Goresan */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-600 dark:text-slate-300">{tSig("strokeWidth")}</span>
            {[
              { label: tSig("strokeThin"), val: 1.8 },
              { label: tSig("strokeMedium"), val: 2.5 },
              { label: tSig("strokeThick"), val: 3.5 },
            ].map((st) => (
              <button
                key={st.val}
                type="button"
                onClick={() => setStrokeWidth(st.val)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer min-h-[44px] sm:min-h-[32px] ${
                  strokeWidth === st.val
                    ? "bg-[#0f6b4f] text-white shadow-xs"
                    : "bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Drawing Canvas Area - Canvas stays light for clean dark ink visibility */}
        <div className="relative w-full h-56 sm:h-64 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-600 bg-white flex items-center justify-center overflow-hidden touch-none select-none shadow-inner">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />

          {/* Watermark Garis Tanda Tangan */}
          <div className="absolute bottom-8 left-8 right-8 pointer-events-none border-b border-gray-300/80 flex justify-between items-end pb-1">
            <span className="text-[10px] text-gray-400 font-mono tracking-wider">
              {tSig("watermarkTitle")}
            </span>
            <span className="text-[10px] text-gray-300 font-mono">
              {tSig("watermarkSignHere")}
            </span>
          </div>

          {isEmpty && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <p className="text-xs text-gray-400 font-medium">
                {tSig("canvasPlaceholder")}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleClear}
            disabled={isEmpty}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none min-h-[44px]"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>{tSig("clear")}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer min-h-[44px]"
            >
              {tSig("cancel")}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isEmpty}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#0f6b4f] hover:bg-[#0c5740] rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50 disabled:pointer-events-none min-h-[44px]"
            >
              <CheckIcon className="w-4 h-4 stroke-[2.5]" />
              <span>{tSig("useSignature")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
