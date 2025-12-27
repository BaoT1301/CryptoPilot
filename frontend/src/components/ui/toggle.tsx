import { useTheme } from "@/contexts/useTheme";
import { Switch } from "./switch";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();
  return (
    <div className="flex items-center gap-2">
      <Sun size={16} aria-hidden />
      <Switch
        checked={isDark}
        onCheckedChange={() => toggleTheme()}
        aria-label="Toggle theme"
      />
      <Moon size={16} aria-hidden />
    </div>
  );
};

export default ThemeToggle;
