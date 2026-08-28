"use client";

import { useEffect, useRef, useState } from "react";
import {
  XMarkIcon,
  ArrowPathIcon,
  CheckIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

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

    // Setup style garis
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;

    // Bersihkan canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    setIsEmpty(true);
  }, [isOpen]);

  // Update properti konteks saat warna atau ketebalan berubah
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
  }, [strokeColor, strokeWidth]);

  if (!isOpen) return null;

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
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
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setIsEmpty(false);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.closePath();
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0f6b4f] flex items-center justify-center">
              <PencilSquareIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Goreskan Tanda Tangan
              </h3>
              <p className="text-xs text-gray-500">
                Tanda tangani di dalam kotak kanvas menggunakan jari atau mouse
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Pengaturan Coretan */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-200/70">
          {/* Warna Tinta */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-600">Warna Tinta:</span>
            <button
              type="button"
              onClick={() => setStrokeColor("#111827")}
              className={`w-6 h-6 rounded-full bg-gray-900 cursor-pointer border-2 transition-transform ${
                strokeColor === "#111827"
                  ? "border-[#0f6b4f] scale-110 shadow-xs"
                  : "border-transparent opacity-80"
              }`}
              title="Hitam Profesional"
            />
            <button
              type="button"
              onClick={() => setStrokeColor("#1e3a8a")}
              className={`w-6 h-6 rounded-full bg-blue-900 cursor-pointer border-2 transition-transform ${
                strokeColor === "#1e3a8a"
                  ? "border-[#0f6b4f] scale-110 shadow-xs"
                  : "border-transparent opacity-80"
              }`}
              title="Biru Pulpen"
            />
          </div>

          {/* Ketebalan Goresan */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-600">Garis:</span>
            {[
              { label: "Tipis", val: 1.8 },
              { label: "Sedang", val: 2.5 },
              { label: "Tebal", val: 3.5 },
            ].map((st) => (
              <button
                key={st.val}
                type="button"
                onClick={() => setStrokeWidth(st.val)}
                className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  strokeWidth === st.val
                    ? "bg-[#0f6b4f] text-white shadow-xs"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Drawing Canvas Area */}
        <div className="relative w-full h-56 sm:h-64 rounded-xl border-2 border-dashed border-gray-300 bg-linear-to-b from-gray-50 to-white flex items-center justify-center overflow-hidden touch-none select-none shadow-inner">
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
              Tanda Tangan Digital
            </span>
            <span className="text-[10px] text-gray-300 font-mono">
              (X) Gores Disini
            </span>
          </div>

          {isEmpty && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <p className="text-xs text-gray-400 font-medium">
                Gunakan jari atau mouse untuk membuat tanda tangan
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
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Bersihkan / Ulangi</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isEmpty}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#0f6b4f] hover:bg-[#0c5740] rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50 disabled:pointer-events-none"
            >
              <CheckIcon className="w-4 h-4 stroke-[2.5]" />
              <span>Gunakan Tanda Tangan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
