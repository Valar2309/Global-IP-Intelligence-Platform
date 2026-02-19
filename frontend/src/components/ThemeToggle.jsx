import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const ThemeToggle = () => {
  const { darkMode, setDarkMode } = useContext(ThemeContext);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="fixed top-5 right-5 z-50 px-4 py-2 rounded-full bg-indigo-600 text-white shadow-lg hover:scale-105 transition-all duration-300"
    >
      {darkMode ? "☀ Light" : "🌙 Dark"}
    </button>
  );
};

export default ThemeToggle;
