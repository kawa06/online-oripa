"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  onScan: (code: string) => void;
};

export function BarcodeScanner({ onScan }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!active) return;
    let stream: MediaStream | null = null;
    let raf = 0;
    let cancelled = false;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled || !videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        // @ts-expect-error BarcodeDetector is not in TS lib yet
        if (typeof BarcodeDetector === "undefined") {
          setError("この端末ではカメラスキャン非対応です。手入力をご利用ください。");
          return;
        }

        // @ts-expect-error BarcodeDetector is not in TS lib yet
        const detector = new BarcodeDetector({ formats: ["code_128", "ean_13", "qr_code"] });

        const tick = async () => {
          if (!videoRef.current || cancelled) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes[0]?.rawValue) {
              onScan(codes[0].rawValue);
              setActive(false);
              return;
            }
          } catch {
            /* ignore frame errors */
          }
          raf = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        setError("カメラへのアクセスが拒否されました");
        setActive(false);
      }
    }

    start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [active, onScan]);

  return (
    <div className="space-y-2">
      <button type="button" className="btn-secondary text-sm" onClick={() => { setError(""); setActive((v) => !v); }}>
        {active ? "カメラ停止" : "カメラでスキャン"}
      </button>
      {active && (
        <video ref={videoRef} className="aspect-video w-full max-w-md rounded-lg border border-border bg-black" muted playsInline />
      )}
      {error && <p className="text-xs text-muted">{error}</p>}
    </div>
  );
}
