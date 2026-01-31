"use client";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeDisplayProps {
  uri: string;
}

export default function QRCodeDisplay({ uri }: QRCodeDisplayProps) {
  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <QRCodeSVG value={uri} size={200} level="M" />
      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        Scan with Google Authenticator, 1Password, or similar app
      </p>
    </div>
  );
}
