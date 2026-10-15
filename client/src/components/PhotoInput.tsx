import { useEffect, useRef, useState } from 'react';
import { Camera, Upload } from 'lucide-react';
import { Avatar } from '@/components/ui';

const SIZE = 320;

function shrink(src: CanvasImageSource, w: number, h: number) {
  const side = Math.min(w, h);
  const c = document.createElement('canvas');
  c.width = SIZE;
  c.height = SIZE;
  c.getContext('2d')!.drawImage(src, (w - side) / 2, (h - side) / 2, side, side, 0, 0, SIZE, SIZE);
  return c.toDataURL('image/jpeg', 0.8);
}

export function PhotoInput({
  value, onChange, name = '', camera = 'user',
}: { value: string; onChange: (v: string) => void; name?: string; camera?: 'user' | 'environment' }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [live, setLive] = useState(false);
  const [error, setError] = useState('');

  const release = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };
  const stop = () => { release(); setLive(false); };
  useEffect(() => release, []);

  useEffect(() => {
    const v = videoRef.current;
    if (live && v && streamRef.current) {
      v.srcObject = streamRef.current;
      void v.play().catch(() => undefined);
    }
  }, [live]);

  const start = async () => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) return setError('The camera needs https or localhost. Upload a photo instead.');
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: camera }, audio: false });
      setLive(true);
    } catch {
      setError('Camera access was blocked. Allow it from the address bar, or upload a photo instead.');
    }
  };

  const capture = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    onChange(shrink(v, v.videoWidth, v.videoHeight));
    stop();
  };

  const upload = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError('Choose an image file.');
    setError('');
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { onChange(shrink(img, img.naturalWidth, img.naturalHeight)); URL.revokeObjectURL(url); };
    img.onerror = () => setError('Could not read that image.');
    img.src = url;
  };

  return (
    <div>
      <div className="flex items-start gap-4">
        {live ? (
          <video ref={videoRef} muted playsInline className="aspect-square w-48 border border-slate-300 object-cover" />
        ) : (
          <Avatar src={value} name={name || 'Photo'} size={96} />
        )}
        <div className="flex flex-col items-start gap-2">
          {live ? (
            <>
              <button type="button" className="btn" onClick={capture}><Camera size={16} />Take photo</button>
              <button type="button" className="btn-ghost" onClick={stop}>Cancel</button>
            </>
          ) : (
            <>
              <button type="button" className="btn-ghost" onClick={start}><Camera size={16} />Use camera</button>
              <label className="btn-ghost cursor-pointer">
                <Upload size={16} />Upload photo
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
              </label>
              {value && <button type="button" className="text-sm text-slate-500 hover:text-red-600" onClick={() => onChange('')}>Remove photo</button>}
            </>
          )}
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>}
    </div>
  );
}
