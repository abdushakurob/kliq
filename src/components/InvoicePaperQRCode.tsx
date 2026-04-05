"use client";

import React from "react";
import QRCode from "react-qr-code";

export default function InvoicePaperQRCode({ value, size = 80 }: { value: string, size?: number }) {
  return (
    <div className="bg-white p-2 rounded-xl border border-surface-container shadow-sm inline-block">
      <QRCode value={value} size={size} fgColor="#003434" />
    </div>
  );
}
