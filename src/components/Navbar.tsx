"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Heart, Menu, Home, Compass, LayoutGrid, Clock, ChevronRight, Library } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export const Navbar = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/ongoing', label: 'Ongoing Series', desc: 'Tayangan Berjalan', icon: Compass },
    { href: '/completed', label: 'Archive', desc: 'Semua Donghua', icon: Library }, // Ganti ke Archive
    { href: '/genres', label: 'Categories', desc: 'Kategori Donghua', icon: LayoutGrid },
    { href: '/favorites', label: 'Favorites', desc: 'Simpanan Anda', icon: Heart },
    { href: '/history', label: 'History', desc: 'Terakhir Dilihat', icon: Clock },
  ];

  return (
    <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <nav className={cn(
        "flex items-center gap-2 p-2 rounded-full border border-black/5 bg-white/80 backdrop-blur-2xl shadow-2xl pointer-events-auto transition-all duration-500",
        scrolled ? "translate-y-0 opacity-100 scale-100" : "translate-y-0"
      )} aria-label="Main Navigation">
        
        {/* QUICK PILL NAV */}
        <Link href="/" aria-label="Home">
            <Button variant="ghost" size="icon" className={cn(
                "w-12 h-12 rounded-full transition-all",
                pathname === '/' ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-muted-foreground"
            )}>
                <Home className="w-5 h-5" />
            </Button>
        </Link>

        <Link href="/search" aria-label="Search">
            <Button variant="ghost" size="icon" className={cn(
                "w-12 h-12 rounded-full transition-all",
                pathname === '/search' ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-muted-foreground"
            )}>
                <Search className="w-5 h-5" />
            </Button>
        </Link>

        {/* MINIMALIST APPLE HAMBURGER */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full text-muted-foreground hover:bg-black/5 transition-colors" aria-label="Menu">
                    <Menu className="w-5 h-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-[3rem] border-t-0 h-auto max-h-[85vh] p-0 overflow-hidden bg-background">
                <div className="h-full flex flex-col pt-12 px-6 pb-16 overflow-y-auto scrollbar-hide">
                    <SheetHeader className="mb-10 text-center">
                        <div className="mx-auto w-12 h-1.5 bg-secondary rounded-full mb-6 opacity-50" />
                        <SheetTitle className="text-2xl font-bold tracking-tight text-foreground">Navigation</SheetTitle>
                    </SheetHeader>

                    {/* MENU LIST: LUXURY CARD STYLE (History-like) */}
                    <div className="space-y-3">
                        {navLinks.map((link) => (
                            <Link 
                                key={link.href} 
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                            >
                                <div className="group flex items-center justify-between p-4 rounded-[2rem] bg-white border border-black/[0.03] shadow-soft hover:shadow-apple transition-all duration-300">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary-dark group-hover:bg-primary group-hover:text-black transition-all duration-300">
                                            <link.icon className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-base text-foreground leading-none mb-1.5">{link.label}</p>
                                            <p className="text-[11px] font-medium text-muted-foreground tracking-wide">{link.desc}</p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-30">PingHua System v2.5</p>
                    </div>
                </div>
            </SheetContent>
        </Sheet>

      </nav>
    </div>
  );
};
