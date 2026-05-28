"use client";

import { useState, useEffect } from "react";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationSubscribe() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState("default");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Verificar si las notificaciones están bloqueadas o descartadas por el usuario localmente
    const isDismissed = localStorage.getItem("dismiss_notifications") === "true";
    setDismissed(isDismissed);

    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    ) {
      setSupported(true);
      setPermission(Notification.permission);

      // Registrar Service Worker y comprobar estado de suscripción
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((sub) => {
          if (sub) {
            setSubscribed(true);
          }
        });
      });
    }
  }, []);

  const handleSubscribe = async () => {
    if (!supported) return;
    setLoading(true);

    try {
      // Registrar el Service Worker
      const registration = await navigator.serviceWorker.register("/sw.js");
      
      // Solicitar permisos al navegador
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        setLoading(false);
        return;
      }

      // Obtener o crear la suscripción usando la clave VAPID pública
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error("VAPID public key no configurada.");
      }

      const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });

      // Enviar la suscripción al backend para guardarla en Supabase
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscription: sub }),
      });

      if (res.ok) {
        setSubscribed(true);
      } else {
        console.error("Error al registrar la suscripción en el backend");
      }
    } catch (err) {
      console.error("Error al intentar suscribirse a notificaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("dismiss_notifications", "true");
    setDismissed(true);
  };

  // Si no está soportado, o ya está suscrito, o decidió descartarlo, o bloqueó permisos, no mostramos nada
  if (!supported || subscribed || dismissed || permission === "denied") {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-premium animate-entrance mb-8">
      {/* Barra decorativa lateral con gradiente */}
      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-mercurio-yellow to-mercurio-pink" />
      
      <div className="flex items-start gap-4">
        <div className="p-3 bg-mercurio-navy/5 rounded-xl text-mercurio-navy shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6 text-mercurio-pink animate-pulse"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
            />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-sm md:text-base">¿Querés enterarte primero de las ofertas?</h3>
          <p className="text-xs text-slate-500 max-w-lg mt-0.5">
            Activá las notificaciones y te avisaremos al instante cada vez que publiquemos una nueva promoción imperdible.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
        <button
          onClick={handleDismiss}
          className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
        >
          Quizás más tarde
        </button>
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="mercurio-button-primary text-xs px-5 py-2.5"
        >
          {loading ? (
            <span className="flex items-center gap-1.5">
              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Activando...
            </span>
          ) : (
            "Activar Notificaciones"
          )}
        </button>
      </div>
    </div>
  );
}
