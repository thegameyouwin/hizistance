import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import MaragaLogo from "./MaragaLogo";
import { Button } from "./ui/button";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { 
      label: "About Maraga", 
      href: "/about",
      hasDropdown: true,
      dropdownItems: [
        { label: "Biography", href: "/about" },
        { label: "Pillars", href: "/pillars" },
      ]
    },
    { label: "Press", href: "/press" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <MaragaLogo />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <div key={link.label} className="relative">
                {link.hasDropdown ? (
                  <button
                    className="flex items-center gap-1 text-foreground/80 hover:text-foreground transition-colors font-medium"
                    onMouseEnter={() => setAboutDropdownOpen(true)}
                    onMouseLeave={() => setAboutDropdownOpen(false)}
                  >
                    {link.label}
                    <ChevronDown className="w-4 h-4" />
                    
                    {/* Dropdown */}
                    {aboutDropdownOpen && (
                      <div className="absolute top-full left-0 pt-2">
                        <div className="bg-card rounded-lg shadow-elevated border border-border py-2 min-w-[160px]">
                          {link.dropdownItems?.map((item) => (
                            <Link
                              key={item.label}
                              to={item.href}
                              className="block px-4 py-2 text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </button>
                ) : (
                  <Link
                    to={link.href}
                    className="text-foreground/80 hover:text-foreground transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button asChild className="btn-movement rounded-full px-6">
              <Link to="/join">Join the Movement</Link>
            </Button>
            <Button asChild className="btn-donate rounded-full px-6">
              <Link to="/donate">Donate</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <div key={link.label}>
                  {link.hasDropdown ? (
                    <div>
                      <span className="text-foreground font-medium">{link.label}</span>
                      <div className="ml-4 mt-2 flex flex-col gap-2">
                        {link.dropdownItems?.map((item) => (
                          <Link
                            key={item.label}
                            to={item.href}
                            className="text-foreground/70 hover:text-foreground"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-foreground font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
              
              <div className="flex flex-col gap-2 pt-4">
                <Button asChild className="btn-movement rounded-full">
                  <Link to="/join" onClick={() => setMobileMenuOpen(false)}>
                    Join the Movement
                  </Link>
                </Button>
                <Button asChild className="btn-donate rounded-full">
                  <Link to="/donate" onClick={() => setMobileMenuOpen(false)}>
                    Donate
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
