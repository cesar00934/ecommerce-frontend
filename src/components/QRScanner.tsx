"use client";
import { Html5Qrcode } from "html5-qrcode";
import React, { useEffect, useRef } from "react";

interface Props {
  onScan: (result: string) => void;
}

export default function QRScanner({ onScan }: Props) {
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scannerRef.current) return;

    const html5QrCode = new Html5Qrcode("reader");

    html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      (decodedText) => onScan(decodedText),
      (error) => console.warn(error)
    );

    // Cleanup
    return () => {
      html5QrCode
        .stop()
        .then(() => console.log("Scanner stopped"))
        .catch((err) => console.warn("Error stopping scanner", err));
    };
  }, [scannerRef]);

  return <div id="reader" ref={scannerRef}></div>;
}
