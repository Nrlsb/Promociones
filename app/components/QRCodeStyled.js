"use client";

import { QRCodeSVG } from "qrcode.react";

export default function QRCodeStyled({
    value = "https://promocionesmercurio.vercel.app",
    size = 300
}) {
    return (
        <div className="p-8 bg-[#162d5f] rounded-[2.5rem] shadow-2xl flex items-center justify-center border border-white/20">
            <div className="bg-white p-4 rounded-3xl shadow-inner">
                <QRCodeSVG
                    value={value}
                    size={size}
                    level="H"
                    includeImage={true}
                    imageSettings={{
                        src: "/logoMercurio.png",
                        x: undefined,
                        y: undefined,
                        height: size * 0.25,
                        width: size * 0.25,
                        excavate: true,
                    }}
                    marginSize={2}
                    fgColor="#162d5f"
                    bgColor="#ffffff"
                />
            </div>
        </div>
    );
}
