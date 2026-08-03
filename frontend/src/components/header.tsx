import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { LogoMark } from "./brand/Logo";
import ThemeToggle from "./ui/toggle";
import { useAuth } from "../lib/AuthContext";
import {
  User,
  Wallet,
  LogOut,
  History,
  TrendingUp,
  MessageSquare,
  Menu,
  X,
} from "lucide-react";

/** Links shown in the mobile menu once signed in. */
const AUTHED_LINKS = [
  { to: "/dashboard", label: "Dashboard", Icon: TrendingUp },
  { to: "/trading", label: "Trading", Icon: TrendingUp },
  { to: "/wallet", label: "Wallet", Icon: Wallet },
  { to: "/chat", label: "AI Chat", Icon: MessageSquare },
  { to: "/history", label: "History", Icon: History },
  { to: "/profile", label: "Profile", Icon: User },
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authenticated, logout, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu on navigation, otherwise it stays open over the new page.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5" aria-label="Crypto Pilot home">
          <LogoMark size={26} animate className="text-foreground" />
          <span className="text-[17px] font-medium tracking-[-0.02em] text-foreground">
            Crypto Pilot
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/about" className="hover:text-primary">
            About
          </Link>
          <Link to="/dashboard" className="hover:text-primary">
            Dashboard
          </Link>
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          {!authenticated ? (
            <>
              <Button asChild variant="outline">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </>
          ) : (
            <DropdownMenu>
              {/* display avatar */}
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer">
                  {user?.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : (
                    <AvatarFallback>
                      {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/wallet"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    Wallet
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/trading"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    Trading
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/chat"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    AI Chat
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/history"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <History className="h-4 w-4 text-muted-foreground" />
                    History
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile controls — below md the desktop blocks above are hidden, so
            without this the header was a bare logo and the site had no
            navigation at all on a phone. */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="p-2 rounded-lg hover:bg-muted transition"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
            <Link
              to="/about"
              className="px-3 py-2 rounded-lg hover:bg-muted transition"
            >
              About
            </Link>

            {authenticated ? (
              <>
                {AUTHED_LINKS.map(({ to, label, Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className="px-3 py-2 rounded-lg hover:bg-muted transition flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-lg hover:bg-muted transition flex items-center gap-2 text-destructive text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link to="/signup">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
