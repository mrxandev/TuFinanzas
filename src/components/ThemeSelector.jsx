import { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { Check, ChevronDown } from "lucide-react";

export const ThemeSelector = ({
  dropdownPosition = "right-0",
  size = "normal",
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle,
  onClose: controlledOnClose,
}) => {
  const { theme: currentTheme, changeTheme, themes } = useTheme();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const containerRef = useRef(null);

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const toggle = () => {
    if (isControlled) {
      controlledOnToggle ? controlledOnToggle() : controlledOnClose?.();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const close = () => {
    if (isControlled) {
      controlledOnClose?.();
    } else {
      setInternalIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelectTheme = (t) => {
    changeTheme(t);
    close();
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Botón Disparador */}
      <button
        type="button"
        onClick={toggle}
        className="btn btn-ghost btn-sm border border-base-300 rounded-xl px-2.5 flex items-center gap-2 hover:bg-base-200 transition-colors"
        title="Cambiar tema de daisyUI"
        aria-label="Selector de temas"
        aria-expanded={isOpen}
      >
        {/* Preview swatch de 4 puntos para el tema activo */}
        <span
          data-theme={currentTheme}
          className="bg-base-100 rounded-md p-1 grid grid-cols-2 gap-0.5 w-5 h-5 shrink-0 border border-base-300 shadow-xs"
        >
          <span className="rounded-full w-1 h-1 bg-primary"></span>
          <span className="rounded-full w-1 h-1 bg-secondary"></span>
          <span className="rounded-full w-1 h-1 bg-accent"></span>
          <span className="rounded-full w-1 h-1 bg-neutral"></span>
        </span>

        {size !== "compact" && (
          <span className="capitalize text-xs font-medium hidden sm:inline">
            {currentTheme}
          </span>
        )}

        <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Menú Desplegable: SOLO se renderiza en el DOM cuando isOpen es true */}
      {isOpen && (
        <div
          className={`absolute ${dropdownPosition} top-full mt-2 bg-base-100 border border-base-300 rounded-2xl z-50 w-52 p-2 shadow-2xl max-h-96 flex flex-col`}
          style={{ transform: "none" }}
        >
          <div className="px-3 py-1.5 text-xs font-semibold text-base-content/60 select-none">
            Tema
          </div>

          <ul className="overflow-y-auto space-y-0.5 flex-1 pr-1 custom-scrollbar">
            {themes.map((t) => {
              const isSelected = currentTheme === t;
              return (
                <li key={t}>
                  <button
                    type="button"
                    onClick={() => handleSelectTheme(t)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors text-left ${
                      isSelected
                        ? "bg-base-200 text-base-content font-semibold"
                        : "hover:bg-base-200/60 text-base-content/80 hover:text-base-content"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Swatch de 4 colores dinámico por tema */}
                      <span
                        data-theme={t}
                        className="bg-base-100 rounded-md p-1 grid grid-cols-2 gap-0.5 w-6 h-6 shrink-0 border border-base-300 shadow-xs"
                      >
                        <span className="rounded-full w-1.5 h-1.5 bg-primary"></span>
                        <span className="rounded-full w-1.5 h-1.5 bg-secondary"></span>
                        <span className="rounded-full w-1.5 h-1.5 bg-accent"></span>
                        <span className="rounded-full w-1.5 h-1.5 bg-neutral"></span>
                      </span>
                      <span className="capitalize text-xs tracking-tight">{t}</span>
                    </div>

                    {/* Checkmark en el tema seleccionado */}
                    {isSelected && (
                      <Check className="w-4 h-4 text-base-content shrink-0" strokeWidth={2.5} />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
