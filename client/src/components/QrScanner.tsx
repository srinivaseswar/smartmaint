import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

const MAX = 640;

/** Reads a QR code from a still image file. Returns the text or null. */
export function decodeQrImage(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1000 / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * scale);
      c.height = Math.round(img.naturalHeight * scale);
      const ctx = c.getContext('2d');
      ctx?.drawImage(img, 0, 0, c.width, c.height);
      const data = ctx?.getImageData(0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(data ? (jsQR(data.data, data.width, data.height)?.data ?? null) : null);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

export function QrScanner({ onResult, onClose }: { onResult: (text: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const resultRef = useRef(onResult);
  resultRef.current = onResult;
  const [error, setError] = useState('');

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const tick = () => {
      const v = videoRef.current;
      if (stopped || !v || !ctx) return;
      if (v.readyState >= 2 && v.videoWidth) {
        const scale = Math.min(1, MAX / v.videoWidth);
        canvas.width = Math.round(v.videoWidth * scale);
        canvas.height = Math.round(v.videoHeight * scale);
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(img.data, img.width, img.height);
        if (code?.data) { resultRef.current(code.data); return; }
      }
      raf = requestAnimationFrame(tick);
    };

    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('The camera needs https or localhost. Upload a QR image instead.');
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
        if (stopped) { stream.getTracks().forEach((t) => t.stop()); return; }
        const v = videoRef.current;
        if (v) { v.srcObject = stream; await v.play().catch(() => undefined); tick(); }
      } catch {
        setError('Camera access was blocked. Allow it from the address bar, or upload a QR image instead.');
      }
    })();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="flex flex-col items-start gap-3">
      {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : (
        <div className="relative">
          <video ref={videoRef} muted playsInline className="aspect-square w-64 border border-slate-300 object-cover" />
          <div className="pointer-events-none absolute inset-8 border-2 border-brand" aria-hidden />
        </div>
      )}
      {!error && <p className="text-sm text-slate-500">Point the camera at the machine's QR code.</p>}
      <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
    </div>
  );
}
