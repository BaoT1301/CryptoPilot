import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ThemeToggle from "./ui/toggle";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../lib/AuthContext";

export default function Header() {
  const navigate = useNavigate();
  const { authenticated, logout } = useAuth();
  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">₿</span>
          </div>
          <span className="text-xl font-bold text-foreground">MyCoinBase</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/dashboard"
            className="text-foreground hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
          {authenticated && (
            <Link
              to="/profile"
              className="text-foreground hover:text-primary transition-colors"
            >
              Profile
            </Link>
          )}
          <Link
            to="/about"
            className="text-foreground hover:text-primary transition-colors"
          >
            About
          </Link>

          <Link
            to="/history"
            className="text-foreground hover:text-primary transition-colors"
          >
            History
          </Link>
          <Link
            to="/wallet"
            className="text-foreground hover:text-primary transition-colors"
          >
            Wallet
          </Link>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {!authenticated ? (
            <>
              <Button asChild variant="outline" size="default">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild variant="default" size="default">
                <Link to="/signup">Get Started</Link>
              </Button>
            </>
          ) : (
            <Button
              onClick={() => {
                logout();
                navigate("/");
                navigate('/');
              }}
              variant="destructive"
              size="default"
            >
              Log out
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
