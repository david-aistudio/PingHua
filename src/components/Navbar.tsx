import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlayCircle, CheckCircle, Grid, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false); // Default closed

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/ongoing', icon: PlayCircle, label: 'Ongoing' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/completed', icon: CheckCircle, label: 'Done' },
    { path: '/genres', icon: Grid, label: 'Genres' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-end gap-2">
      
      {/* Expandable Nav Items */}
      <nav 
        className={cn(
          "bg-black/75 backdrop-blur-2xl border border-white/20 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center gap-1 md:gap-4 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          isOpen ? "w-[320px] md:w-[400px] px-2 py-2 opacity-100 translate-y-0" : "w-0 px-0 opacity-0 translate-y-10"
        )}
      >
        <div className="flex w-full justify-between items-center min-w-max">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path) && item.path !== '/search');
            
            return (
              <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "rounded-full h-10 w-10 md:h-12 md:w-12 transition-all duration-300",
                    isActive 
                      ? "bg-white text-black hover:bg-white/90 shadow-lg shadow-white/20 scale-105" 
                      : "text-gray-400 hover:text-white hover:bg-white/10"
                  )}
                >
                  <item.icon className={cn("h-4 w-4 md:h-5 md:w-5", isActive && "fill-current")} />
                  <span className="sr-only">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Toggle Button */}
      <Button
        size="icon"
        className={cn(
            "h-14 w-14 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-110 active:scale-90 border",
            isOpen 
              ? "bg-white text-black border-white hover:bg-white/90" 
              : "bg-black/75 backdrop-blur-2xl text-white border-white/20 hover:bg-black"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
            <X className="h-6 w-6" />
        ) : (
            <Menu className="h-6 w-6" />
        )}
        <span className="sr-only">Toggle Menu</span>
      </Button>

    </div>
  );
};
