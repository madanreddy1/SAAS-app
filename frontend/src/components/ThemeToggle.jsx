import { useTheme } from "../context/ThemeContext";
import { IconMoon, IconSun } from "./icons";

function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={`btn btn-ghost btn-compact shrink-0 gap-2 ${className}`}
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
    >
      {theme === "dark" ? <IconSun /> : <IconMoon />}
      <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}

export default ThemeToggle;
