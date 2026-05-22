"use client";

import { useState, useRef, useEffect } from "react";

const PAYMENT_METHODS = [
  { id: "mercadopago", name: "Mercado Pago", logo: "/mercadopago.png" },
  { id: "mastercard", name: "Mastercard", logo: "/mastercard.png" },
  { id: "visa", name: "Visa", logo: "/visa.png" },
  { id: "efectivo", name: "Efectivo", logo: "/efectivo.svg" }
];

export default function EditPromoModal({ promo, onClose, onSaveSuccess }) {
  const [title, setTitle] = useState("");
  const [terms, setTerms] = useState("");
  const [selectedMethods, setSelectedMethods] = useState([]);
  const [installments, setInstallments] = useState("");
  const [customInstallments, setCustomInstallments] = useState("");
  const [isCustomInstallments, setIsCustomInstallments] = useState(false);
  const [newImage, setNewImage] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  // Pre-fill form when promo changes
  useEffect(() => {
    if (promo) {
      setTitle(promo.title || "");
      setTerms(promo.terms || "");
      setSelectedMethods(promo.payment_methods || []);
      
      const inst = promo.installments || "";
      setInstallments(inst);

      const presets = ["3 cuotas sin interés", "6 cuotas sin interés", "12 cuotas sin interés"];
      if (inst && !presets.includes(inst)) {
        setIsCustomInstallments(true);
        setCustomInstallments(inst);
      } else {
        setIsCustomInstallments(false);
        setCustomInstallments("");
      }

      setNewImage(null);
      if (newImagePreview) {
        URL.revokeObjectURL(newImagePreview);
        setNewImagePreview(null);
      }

      if (editorRef.current) {
        editorRef.current.innerHTML = promo.terms || "";
      }
      setError(null);
    }
  }, [promo]);

  const toggleMethod = (id) => {
    setSelectedMethods((prev) => {
      const next = prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id];
      if (!next.includes("mastercard") && !next.includes("visa")) {
        setInstallments("");
        setCustomInstallments("");
        setIsCustomInstallments(false);
      }
      return next;
    });
  };

  const handleEditorInput = (e) => {
    let html = e.currentTarget.innerHTML;
    if (html === "<br>" || html === "<p><br></p>" || html === "<div><br></div>" || html === "<div></div>") {
      e.currentTarget.innerHTML = "";
      html = "";
    }
    setTerms(html);
  };

  const handlePaste = (e) => {
    const items = (e.clipboardData || e.originalEvent?.clipboardData)?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") === 0) {
          e.preventDefault();
          alert("No se permiten imágenes en el texto de bases y condiciones.");
          return;
        }
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setError(null);
      if (newImagePreview) {
        URL.revokeObjectURL(newImagePreview);
      }
      setNewImage(file);
      setNewImagePreview(URL.createObjectURL(file));
    }
  };

  const handleResetImage = () => {
    setNewImage(null);
    if (newImagePreview) {
      URL.revokeObjectURL(newImagePreview);
      setNewImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("El título es obligatorio.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("id", promo.id);
      formData.append("title", title.trim());
      formData.append("terms", terms.trim());
      formData.append("payment_methods", JSON.stringify(selectedMethods));
      formData.append("installments", installments.trim());
      
      if (newImage) {
        formData.append("image", newImage);
      }

      const res = await fetch("/api/promotions", {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al actualizar la promoción.");
      }

      if (newImagePreview) {
        URL.revokeObjectURL(newImagePreview);
      }

      onSaveSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!promo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-entrance"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800">
            Editar Promoción
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {/* Título */}
          <div>
            <label className="block text-lg font-semibold text-slate-700 mb-2">
              Título de la promoción
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: 20% OFF en Pintura Látex"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-mercurio-navy placeholder:text-slate-400"
            />
          </div>

          {/* Imagen de la promoción */}
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-slate-700">
              Imagen de la promoción
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                <img
                  src={newImagePreview || promo.url}
                  alt={title}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 w-full text-center sm:text-left">
                <p className="text-sm text-slate-500 mb-2">
                  {newImage ? `Nueva imagen seleccionada: ${newImage.name}` : "Podés cambiar la imagen actual subiendo un archivo nuevo."}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border border-mercurio-navy text-mercurio-navy hover:bg-mercurio-navy hover:text-white rounded-xl text-sm font-bold transition-all active:scale-95 cursor-pointer"
                  >
                    Seleccionar nueva imagen
                  </button>
                  {newImage && (
                    <button
                      type="button"
                      onClick={handleResetImage}
                      className="px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-95"
                    >
                      Deshacer
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Métodos de pago */}
          <div>
            <label className="block text-lg font-semibold text-slate-700 mb-3">
              Métodos de pago aceptados
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {PAYMENT_METHODS.map((method) => {
                const isSelected = selectedMethods.includes(method.id);
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => toggleMethod(method.id)}
                    className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 cursor-pointer select-none active:scale-95 ${
                      isSelected
                        ? "border-mercurio-navy bg-slate-50 shadow-md ring-2 ring-mercurio-navy/15 scale-102"
                        : "border-slate-200 bg-white hover:border-slate-400 opacity-60 hover:opacity-95"
                    }`}
                  >
                    <div className="h-10 w-full flex items-center justify-center mb-2">
                      <img
                        src={method.logo}
                        alt={method.name}
                        className={`h-full max-w-full object-contain transition-all duration-300 ${
                          isSelected ? "filter-none opacity-100" : "filter grayscale opacity-60"
                        }`}
                      />
                    </div>
                    <span className={`text-xs font-bold transition-colors ${isSelected ? "text-mercurio-navy" : "text-slate-500"}`}>
                      {method.name}
                    </span>
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-mercurio-navy text-white rounded-full p-0.5 shadow-sm">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cuotas con Tarjeta de Crédito */}
          {(selectedMethods.includes("mastercard") || selectedMethods.includes("visa")) && (
            <div className="space-y-3 p-5 bg-slate-50 rounded-2xl border border-slate-100 animate-entrance">
              <label className="block text-base font-bold text-slate-700">
                Cuotas con tarjeta de crédito
              </label>
              
              <div className="flex flex-wrap gap-2.5">
                {[
                  { id: "none", label: "1 Pago" },
                  { id: "3_sin", label: "3 cuotas sin interés" },
                  { id: "6_sin", label: "6 cuotas sin interés" },
                  { id: "12_sin", label: "12 cuotas sin interés" },
                  { id: "custom", label: "Otro..." }
                ].map((opt) => {
                  const isSelected = 
                    (opt.id === "none" && !installments) ||
                    (opt.id === "3_sin" && installments === "3 cuotas sin interés") ||
                    (opt.id === "6_sin" && installments === "6 cuotas sin interés") ||
                    (opt.id === "12_sin" && installments === "12 cuotas sin interés") ||
                    (opt.id === "custom" && isCustomInstallments);

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        if (opt.id === "none") {
                          setInstallments("");
                          setIsCustomInstallments(false);
                        } else if (opt.id === "custom") {
                          setIsCustomInstallments(true);
                          setInstallments(customInstallments);
                        } else {
                          setIsCustomInstallments(false);
                          const labelMap = {
                            "3_sin": "3 cuotas sin interés",
                            "6_sin": "6 cuotas sin interés",
                            "12_sin": "12 cuotas sin interés"
                          };
                          setInstallments(labelMap[opt.id]);
                        }
                      }}
                      className={`px-4 py-2.5 rounded-xl border text-sm font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
                        isSelected
                          ? "border-mercurio-navy bg-white text-mercurio-navy shadow-sm ring-2 ring-mercurio-navy/10"
                          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {isCustomInstallments && (
                <div className="mt-3 animate-entrance">
                  <input
                    type="text"
                    value={customInstallments}
                    onChange={(e) => {
                      setCustomInstallments(e.target.value);
                      setInstallments(e.target.value);
                    }}
                    placeholder="Ej: 18 cuotas fijas o 3 cuotas con recargo"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mercurio-navy bg-white placeholder:text-slate-400"
                  />
                </div>
              )}
            </div>
          )}

          {/* Términos y condiciones */}
          <div>
            <label className="block text-lg font-semibold text-slate-700 mb-2">
              Términos y condiciones (opcional)
            </label>
            <div className="w-full rounded-xl border border-slate-300 overflow-hidden bg-white focus-within:ring-2 focus-within:ring-mercurio-navy/30 focus-within:border-mercurio-navy transition-all">
              {/* Barra de herramientas */}
              <div className="flex flex-wrap items-center gap-1 bg-slate-50 border-b border-slate-200 px-3 py-2 select-none">
                <button
                  type="button"
                  onClick={() => {
                    document.execCommand("bold", false, null);
                    editorRef.current?.focus();
                  }}
                  className="w-8 h-8 rounded hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center font-bold text-slate-700 text-sm transition-colors"
                  title="Negrita"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => {
                    document.execCommand("italic", false, null);
                    editorRef.current?.focus();
                  }}
                  className="w-8 h-8 rounded hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center italic font-serif text-slate-700 text-sm transition-colors"
                  title="Cursiva"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => {
                    document.execCommand("underline", false, null);
                    editorRef.current?.focus();
                  }}
                  className="w-8 h-8 rounded hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center underline text-slate-700 text-sm transition-colors"
                  title="Subrayado"
                >
                  U
                </button>
                <div className="w-[1px] h-5 bg-slate-300 mx-1" />
                <button
                  type="button"
                  onClick={() => {
                    document.execCommand("insertUnorderedList", false, null);
                    editorRef.current?.focus();
                  }}
                  className="px-2 h-8 rounded hover:bg-slate-200 active:bg-slate-300 flex items-center gap-1 text-slate-700 text-xs font-semibold transition-colors"
                  title="Lista con viñetas"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span>Viñetas</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    document.execCommand("insertOrderedList", false, null);
                    editorRef.current?.focus();
                  }}
                  className="px-2 h-8 rounded hover:bg-slate-200 active:bg-slate-300 flex items-center gap-1 text-slate-700 text-xs font-semibold transition-colors"
                  title="Lista numerada"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 6h13M7 12h13M7 18h13M3 6h.01M3 12h.01M3 18h.01" />
                  </svg>
                  <span>Números</span>
                </button>
                <div className="w-[1px] h-5 bg-slate-300 mx-1" />
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("¿Querés borrar todo el formato del texto seleccionado?")) {
                      document.execCommand("removeFormat", false, null);
                    }
                    editorRef.current?.focus();
                  }}
                  className="w-8 h-8 rounded hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center text-slate-700 text-sm transition-colors"
                  title="Limpiar formato"
                >
                  🧼
                </button>
              </div>
              
              {/* Editor de texto editable */}
              <div
                ref={editorRef}
                contentEditable
                onInput={handleEditorInput}
                onPaste={handlePaste}
                placeholder="Pegá o escribí aquí las bases y condiciones..."
                className="w-full min-h-[200px] max-h-[300px] overflow-y-auto px-4 py-3 text-base focus:outline-none bg-white terms-editor terms-content"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          )}

          {/* Footer Actions */}
          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 px-6 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-full font-bold text-base transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 mercurio-button-primary py-3 px-6 shadow-md disabled:opacity-50 h-12"
            >
              {loading ? (
                <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              ) : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
