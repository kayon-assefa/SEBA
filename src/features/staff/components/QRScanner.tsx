import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icons";
import { useLanguage } from "../i18n";

type CameraDevice = { deviceId: string; label: string };

/**
 * Camera-based QR scanner. Uses the browser's native BarcodeDetector API
 * (Chrome / Edge / Android — no extra npm package required). Falls back to a
 * manual code-entry field on browsers that don't support it yet (Safari/iOS
 * as of this writing) so the page never dead-ends.
 */
export function QRScanner({ onDetect }: { onDetect: (rawValue: string) => void }) {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastValueRef = useRef<string | null>(null);

  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState<"idle" | "starting" | "scanning" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [manualCode, setManualCode] = useState("");

  const detectorSupported = typeof window !== "undefined" && "BarcodeDetector" in window;

  async function loadCameras() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cams = devices
        .filter(d => d.kind === "videoinput")
        .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Camera ${i + 1}` }));
      setCameras(cams);
      if (cams.length && !selectedCamera) setSelectedCamera(cams[0].deviceId);
    } catch { /* ignore — permission not granted yet */ }
  }

  useEffect(() => { loadCameras(); return () => stopStream(); }, []); // eslint-disable-line

  function stopStream() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setScanning(false);
  }

  async function start() {
    setErrorMsg("");
    setStatus("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: selectedCamera ? { deviceId: { exact: selectedCamera } } : { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      await loadCameras(); // labels are populated after permission is granted
      setScanning(true);
      setStatus("scanning");
      if (detectorSupported) runDetectionLoop();
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e?.message || "Couldn't access the camera. Check permissions and try again.");
    }
  }

  function runDetectionLoop() {
    // @ts-ignore — BarcodeDetector isn't in the default TS lib yet
    const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
    const tick = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      try {
        const codes = await detector.detect(videoRef.current);
        if (codes?.length) {
          const value = codes[0].rawValue as string;
          if (value && value !== lastValueRef.current) {
            lastValueRef.current = value;
            onDetect(value);
            return; // stop the loop — page decides what happens next (result view)
          }
        }
      } catch { /* transient decode errors are normal, keep looping */ }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  return (
    <div>
      {cameras.length > 1 && (
        <div className="ss-field" style={{ maxWidth: 380, margin: "0 auto 16px" }}>
          <label>Camera</label>
          <select
            className="ss-select" value={selectedCamera}
            onChange={e => { setSelectedCamera(e.target.value); if (scanning) { stopStream(); } }}
          >
            {cameras.map(c => <option key={c.deviceId} value={c.deviceId}>{c.label}</option>)}
          </select>
        </div>
      )}

      <div className="ss-scan-frame">
        <video ref={videoRef} muted playsInline />
        {!scanning && (
          <div style={{
            position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: 14, color: "#fff", background: "rgba(0,0,0,.55)",
          }}>
            <Icon.Camera size={40} />
            <button className="ss-btn ss-btn-primary" onClick={start} disabled={status === "starting"}>
              {status === "starting" ? t("scan.startingCamera") : t("scan.startScanning")}
            </button>
            {errorMsg && (
              <p style={{ maxWidth: 260, textAlign: "center", fontSize: 12.5, color: "#FFD9D5" }}>{errorMsg}</p>
            )}
          </div>
        )}
        {scanning && (
          <>
            <div className="ss-scan-corners">
              <div className="ss-scan-corner tl" /><div className="ss-scan-corner tr" />
              <div className="ss-scan-corner bl" /><div className="ss-scan-corner br" />
            </div>
            <div className="ss-scan-line" />
            <div className="ss-scan-dots">
              <div className="ss-scan-dot" /><div className="ss-scan-dot" /><div className="ss-scan-dot" />
            </div>
          </>
        )}
      </div>

      {scanning && (
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <button className="ss-btn ss-btn-secondary ss-btn-sm" onClick={stopStream}>{t("scan.stopCamera")}</button>
        </div>
      )}

      <div className="ss-card ss-card-pad" style={{ maxWidth: 380, margin: "18px auto 0" }}>
        <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 10 }}>
          {detectorSupported ? t("scan.manualHint") : t("scan.manualHintUnsupported")}
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="ss-input" placeholder="e.g. SEBA:APPT:8F2C1A" value={manualCode}
            onChange={e => setManualCode(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && manualCode.trim()) onDetect(manualCode.trim()); }}
          />
          <button className="ss-btn ss-btn-primary" disabled={!manualCode.trim()} onClick={() => onDetect(manualCode.trim())}>
            {t("scan.lookUp")}
          </button>
        </div>
      </div>
    </div>
  );
}
