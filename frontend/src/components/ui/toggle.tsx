import { useTheme } from "@/contexts/useTheme";
import { Button } from "./button";
const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();
  return (
    <Button
      variant="secondary"
      onClick={toggleTheme}
      className="cursor-pointer"
      aria-label="Toggle theme"
    >
      {isDark ? "Light Mode" : "Dark Mode"}
    </Button>
  );
};

export default ThemeToggle;
