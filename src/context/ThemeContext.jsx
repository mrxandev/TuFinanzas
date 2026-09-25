import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme] = useState("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("daisyui-theme", "dark");
  }, []);

  const changeTheme = () => {
    // Modo estrictamente oscuro
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("daisyui-theme", "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme: "dark", changeTheme, themes: ["dark"] }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
