// app/admin/productos/escanear/page.tsx (Con importaciones corregidas)
"use client";

import { useRef, useState, useEffect } from "react";
// 1. CORRECCIÓN: Importamos las clases del navegador desde '@zxing/browser'
import {
  BrowserMultiFormatReader,
  IScannerControls,
} from "@zxing/browser";
// 2. CORRECCIÓN: Importamos las clases del motor de decodificación desde '@zxing/library'
import {
  NotFoundException,
  DecodeHintType,
  BarcodeFormat,
} from "@zxing/library";
import { Camera, XCircle, Upload, CheckCircle, AlertTriangle } from "lucide-react";

export default function ScanPage() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // El resto del código que te proporcioné en la respuesta anterior es correcto.
  // No necesita ningún otro cambio.
  // ... (pega aquí el resto del código de la respuesta anterior)

  // Solo para que el ejemplo sea autocontenido, aquí está el resto del código:
  useEffect(() => {
    const hints = new Map();
    const formats = [
      BarcodeFormat.QR_CODE,
      BarcodeFormat.EAN_13,
      BarcodeFormat.CODE_128,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_39,
      BarcodeFormat.ITF,
    ];
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    hints.set(DecodeHintType.TRY_HARDER, true);

    codeReaderRef.current = new BrowserMultiFormatReader(hints);

    return () => {
      controlsRef.current?.stop();
    };
  }, []);

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const handleSuccess = (text: string) => {
    setResult(text);
    stopScanner();
  };

  const startScanner = async () => {
    if (!codeReaderRef.current || !videoRef.current) return;
    
    stopScanner();
    setResult(null);
    setError(null);
    setIsScanning(true);

    try {
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      if (devices.length === 0) {
        showError("No se encontró ninguna cámara.");
        setIsScanning(false);
        return;
      }

      const rearCamera = devices.find(d => /back|rear|trás/i.test(d.label)) || devices[0];

      controlsRef.current = await codeReaderRef.current.decodeFromVideoDevice(
        rearCamera.deviceId,
        videoRef.current,
        (res, err) => {
          if (res) {
            handleSuccess(res.getText());
          }
          if (err && !(err instanceof NotFoundException)) {
            console.error("Error de decodificación:", err);
          }
        }
      );
    } catch (err) {
      console.error("Error al iniciar la cámara:", err);
      showError("No se pudo abrir la cámara. ¿Permiso denegado? Usa HTTPS o localhost.");
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    controlsRef.current?.stop();
    setIsScanning(false);
  };

  const scanFromFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !codeReaderRef.current) return;

    stopScanner();
    setResult(null);
    setError(null);

    try {
      const image = new Image();
      image.src = URL.createObjectURL(file);
      await new Promise<void>(resolve => { image.onload = () => resolve(); });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("No se pudo crear el canvas");

      const padding = image.width * 0.1;
      canvas.width = image.width + padding * 2;
      canvas.height = image.height + padding * 2;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, padding, padding);

      const res = await codeReaderRef.current.decodeFromCanvas(canvas);
      handleSuccess(res.getText());

    } catch (err) {
      console.error("Error al escanear archivo:", err);
      showError("No se detectó ningún código en la imagen.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="font-bold text-xl mb-3 text-center">Escáner ZXing</h1>
      <div className="relative bg-black rounded-lg aspect-video">
        <video ref={videoRef} className="w-full h-full rounded-lg" />
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <p className="text-white">La cámara está detenida</p>
          </div>
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button onClick={startScanner} disabled={isScanning} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2 disabled:bg-blue-300">
          <Camera size={18} /> Iniciar
        </button>
        <button onClick={stopScanner} disabled={!isScanning} className="bg-red-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2 disabled:bg-red-300">
          <XCircle size={18} /> Detener
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="col-span-2 bg-gray-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2">
          <Upload size={18} /> Escanear Archivo
        </button>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={scanFromFile} className="hidden" />
      </div>
      <div className="mt-4 min-h-[80px]">
        {result && (
          <div className="p-3 bg-green-100 border border-green-400 rounded">
            <div className="font-bold flex items-center gap-2"><CheckCircle size={18} /> Resultado:</div>
            <p className="font-mono break-all mt-1">{result}</p>
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 rounded text-red-700 flex items-center gap-2">
            <AlertTriangle size={18} /> {error}
          </div>
        )}
      </div>
    </div>
  );
}
