"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Heart, Menu, Home, Compass, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export const Navbar = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <nav className={cn(
        "flex items-center gap-2 p-2 rounded-full border border-black/5 bg-white/80 backdrop-blur-2xl shadow-2xl pointer-events-auto transition-all duration-500",
        scrolled ? "translate-y-0 opacity-100" : "translate-y-0"
      )} aria-label="Main Navigation">
        
        {/* PILL NAVIGATION */}
        <Link href="/" aria-label="Go to Homepage">
            <Button variant="ghost" size="icon" className={cn(
                "w-12 h-12 rounded-full transition-all",
                pathname === '/' ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-muted-foreground"
            )} aria-label="Home">
                <Home className="w-5 h-5" />
            </Button>
        </Link>

        <Link href="/search" aria-label="Search Donghua">
            <Button variant="ghost" size="icon" className={cn(
                "w-12 h-12 rounded-full transition-all",
                pathname === '/search' ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-muted-foreground"
            )} aria-label="Search">
                <Search className="w-5 h-5" />
            </Button>
        </Link>

        {/* HAMBURGER TRIGGER */}
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full text-muted-foreground" aria-label="Open Menu">
                    <Menu className="w-5 h-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-[2.5rem] border-t-0 h-[60vh] p-8">
                <SheetHeader className="mb-8">
                    <SheetTitle className="text-left text-2xl font-black">PingHua Menu</SheetTitle>
                </SheetHeader>
                <div className="grid grid-cols-2 gap-4">
                    <Link href="/ongoing" className="col-span-2">
                        <Button variant="secondary" className="w-full h-16 rounded-2xl justify-start px-6 text-lg font-bold gap-4">
                            <Compass className="w-6 h-6 text-primary" /> Ongoing Series
                        </Button>
                    </Link>
                    <Link href="/favorites">
                        <Button variant="secondary" className="w-full h-16 rounded-2xl justify-start px-6 text-lg font-bold gap-4">
                            <Heart className="w-6 h-6 text-red-500" /> Favorites
                        </Button>
                    </Link>
                    <Link href="/genres">
                        <Button variant="secondary" className="w-full h-16 rounded-2xl justify-start px-6 text-lg font-bold gap-4">
                            <Menu className="w-6 h-6 text-blue-500" /> Genres
                        </Button>
                    </Link>
                </div>
            </SheetContent>
        </Sheet>

      </nav>
    </div>
  );
};
