"use client";

import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

export default function QRCodeStyled({
    value = "https://promocionesmercurio.vercel.app",
    size = 320
}) {
    const qrRef = useRef(null);
    const qrCode = useRef(null);

    useEffect(() => {
        // Solo inicializar en el cliente
        if (!qrCode.current) {
            qrCode.current = new QRCodeStyling({
                width: size,
                height: size,
                data: value,
                image: "/logoMercurio.png",
                margin: 10,
                qrOptions: {
                    typeNumber: "0",
                    mode: "Byte",
                    errorCorrectionLevel: "H"
                },
                imageOptions: {
                    hideBackgroundDots: true,
                    imageSize: 0.4,
                    margin: 8,
                    crossOrigin: "anonymous",
                },
                dotsOptions: {
                    color: "#162d5f",
                    type: "rounded"
                },
                backgroundOptions: {
                    color: "#ffffff",
                },
                cornersSquareOptions: {
                    color: "#162d5f",
                    type: "extra-rounded"
                },
                cornersDotOptions: {
                    color: "#162d5f",
                    type: "dot"
                }
            });
        }

        if (qrRef.current) {
            qrRef.current.innerHTML = ""; // Limpiar antes de renderizar
            qrCode.current.append(qrRef.current);
        }
    }, [value, size]);

    useEffect(() => {
        if (qrCode.current) {
            qrCode.current.update({
                data: value
            });
        }
    }, [value]);

    return (
        <div className="p-8 bg-gradient-to-br from-[#162d5f] to-[#0d1b3a] rounded-[3rem] shadow-[0_20px_50px_rgba(22,45,95,0.3)] flex items-center justify-center border border-white/10 relative overflow-hidden group">
            {/* Glow effect background */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="bg-white p-5 rounded-[2rem] shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] transition-transform duration-500 group-hover:scale-[1.02]">
                <div ref={qrRef} className="overflow-hidden rounded-xl" />
            </div>
        </div>
    );
}
