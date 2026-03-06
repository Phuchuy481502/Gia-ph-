"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";

interface QRCodeSectionProps {
  url: string;
  name: string;
}

export default function QRCodeSection({ url, name }: QRCodeSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: 220,
      margin: 2,
      color: { dark: "#292524", light: "#ffffff" },
    }, (err) => {
      if (err) return;
      setDataUrl(canvasRef.current?.toDataURL("image/png") ?? null);
    });
  }, [url]);

  function handleDownload() {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `qr-tuong-nho-${name.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.click();
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        className="rounded-xl shadow-sm border border-stone-100"
      />
      <button
        onClick={handleDownload}
        disabled={!dataUrl}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-40 transition-colors"
      >
        <Download className="size-4" />
        Tải QR xuống (PNG)
      </button>
      <p className="text-xs text-stone-400 break-all max-w-xs text-center">{url}</p>
    </div>
  );
}
