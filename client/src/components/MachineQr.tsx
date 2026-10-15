import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import type { Row } from '@/lib/store';
import { machineQrPayload } from '@/lib/qr';

export function MachineQr({ machine }: { machine: Row }) {
  const [url, setUrl] = useState('');
  const payload = machineQrPayload(machine);

  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(payload, { margin: 1, width: 240, errorCorrectionLevel: 'M' })
      .then((u) => { if (alive) setUrl(u); })
      .catch(() => { if (alive) setUrl(''); });
    return () => { alive = false; };
  }, [payload]);

  return (
    <div className="flex flex-wrap items-center gap-6 px-6 py-5">
      {url ? <img src={url} alt={`QR code for ${machine.name}`} className="h-40 w-40 border border-slate-200" /> : <div className="h-40 w-40 border border-slate-200" />}
      <div className="text-sm">
        <p className="max-w-sm text-slate-600">Print this and stick it on the machine. Scanning it on the Add machine form fills in these details.</p>
        {url && <a href={url} download={`${machine.machineCode}-qr.png`} className="btn-ghost mt-3">Download QR image</a>}
      </div>
    </div>
  );
}
