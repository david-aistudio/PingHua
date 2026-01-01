import Link from 'next/link';
import { Github, Mail, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-black/5 bg-white/50 backdrop-blur-sm text-foreground py-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand & Contact */}
          <div className="space-y-4">
            <h3 className="text-2xl font-black tracking-tighter uppercase italic">
                PingHua
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              Platform Nonton Donghua Subtitle Indonesia Terlengkap & Terupdate.
              Nikmati pengalaman streaming modern tanpa hambatan.
            </p>
            <div className="pt-2">
              <a 
                href="mailto:admin@pinghua.qzz.io" 
                className="flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary-dark transition-colors"
                aria-label="Kirim email ke admin PingHua"
              >
                <Mail className="w-4 h-4 text-primary-dark" aria-hidden="true" />
                admin@pinghua.qzz.io
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Sitemap Index</h4>
            <ul className="space-y-3 text-sm font-bold">
              <li><Link href="/" className="hover:text-primary-dark transition-colors">Home Discovery</Link></li>
              <li><Link href="/ongoing" className="hover:text-primary-dark transition-colors">Ongoing Series</Link></li>
              <li><Link href="/completed" className="hover:text-primary-dark transition-colors">Completed Units</Link></li>
              <li><Link href="/search" className="hover:text-primary-dark transition-colors">Search Database</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Neural Net</h4>
            <p className="text-sm text-muted-foreground font-medium">
              Follow development updates or contribute to the core system.
            </p>
            <a 
              href="https://github.com/david-aistudio" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white bg-black px-6 py-3 rounded-full hover:bg-primary-dark hover:text-white transition-all shadow-lg"
              aria-label="Follow David on GitHub"
            >
              <Github className="w-4 h-4" aria-hidden="true" />
              Developer Profile
            </a>
          </div>

          {/* Disclaimer */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Legal Protocol</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
              PingHua does not store any files on its server. All contents are provided by non-affiliated third parties.
              This system is strictly for educational purposes.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-black/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            © {new Date().getFullYear()} PINGHUA_CORE. ALL_RIGHTS_RESERVED.
          </p>
          <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-widest">
            ENGINEERED WITH <Heart className="w-3 h-3 text-red-500 fill-red-500" aria-hidden="true" /> BY DAVID
          </p>
        </div>
      </div>
    </footer>
  );
};
