import { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "../context/ThemeContext";
import { Check, ChevronDown, Search } from "lucide-react";

export const ThemeSelector = ({
  dropdownPosition = "right-0",
  size = "normal",
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle,
  onClose: controlledOnClose,
}) => {
  const { theme: currentTheme, changeTheme, themes } = useTheme();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const toggle = () => {
    if (isControlled) {
      if (controlledOnToggle) {
        controlledOnToggle();
      } else if (controlledOnClose) {
        controlledOnClose();
      }
    } else {
      setInternalIsOpen((prev) => !prev);
    }
  };

  const close = useCallback(() => {
    if (isControlled) {
      if (controlledOnClose) controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
    setSearch("");
  }, [isControlled, controlledOnClose]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        close();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, close]);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelectTheme = (t) => {
    changeTheme(t);
    close();
  };

  const filteredThemes = themes.filter((t) =>
    t.toLowerCase().includes(search.toLowerCase())
  );

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
          <span className="capitalize text-xs font-semibold hidden sm:inline text-base-content">
            {currentTheme}
          </span>
        )}

        <ChevronDown
          className={`w-3.5 h-3.5 text-base-content/60 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Menú Desplegable */}
      {isOpen && (
        <div
          className={`absolute ${dropdownPosition} top-full mt-2 bg-base-100 border border-base-300 rounded-2xl z-50 w-56 p-2 shadow-2xl max-h-96 flex flex-col`}
          style={{ transform: "none" }}
        >
          <div className="px-2 py-1.5 flex items-center justify-between text-xs font-semibold text-base-content/60 select-none">
            <span>Temas ({themes.length})</span>
            <span className="badge badge-xs badge-ghost font-mono uppercase">daisyUI</span>
          </div>

          {/* Campo de búsqueda de temas */}
          <div className="px-1 pb-2">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar tema..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input input-bordered input-xs w-full pl-7 rounded-lg text-xs"
              />
              <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-base-content/40" />
            </div>
          </div>

          {/* Lista de temas */}
          <ul className="overflow-y-auto space-y-0.5 flex-1 pr-1 custom-scrollbar">
            {filteredThemes.length === 0 ? (
              <li className="px-3 py-4 text-center text-xs text-base-content/50">
                No se encontró &ldquo;{search}&rdquo;
              </li>
            ) : (
              filteredThemes.map((t) => {
                const isSelected = currentTheme === t;
                return (
                  <li key={t}>
                    <button
                      type="button"
                      onClick={() => handleSelectTheme(t)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors text-left ${
                        isSelected
                          ? "bg-base-200 text-base-content font-bold"
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
                        <Check className="w-4 h-4 text-primary shrink-0" strokeWidth={2.5} />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
