import { Link } from 'react-router-dom';
import { Github, Mail, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-background text-foreground mt-auto pt-6 pb-6 md:pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-2">
          {/* Brand & Contact */}
          <div className="space-y-4">
            <h3 className="text-2xl font-extrabold tracking-tighter">
              PingHua
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Platform Nonton Donghua Subtitle Indonesia Terlengkap & Terupdate.
              Nikmati pengalaman streaming tanpa iklan yang mengganggu.
            </p>
            <div className="pt-2" data-nosnippet>
              <a 
                href="mailto:papengcepoko@gmail.com" 
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                papengcepoko@gmail.com
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4" data-nosnippet>
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/ongoing" className="text-muted-foreground hover:text-primary transition-colors">Ongoing Series</Link>
              </li>
              <li>
                <Link to="/completed" className="text-muted-foreground hover:text-primary transition-colors">Completed Series</Link>
              </li>
              <li>
                <Link to="/search" className="text-muted-foreground hover:text-primary transition-colors">Search</Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4" data-nosnippet>
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Connect</h4>
            <p className="text-sm text-muted-foreground">
              Follow development updates or contribute to the project.
            </p>
            <a 
              href="https://github.com/david-aistudio" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground bg-secondary/50 px-4 py-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-all border border-border"
            >
              <Github className="w-4 h-4" />
              david-aistudio
            </a>
          </div>

          {/* Disclaimer */}
          <div className="space-y-4" data-nosnippet>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500">Disclaimer</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              PingHua does not store any files on its server. All contents are provided by non-affiliated third parties.
              This site is strictly for educational and entertainment purposes.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-2 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} PingHua. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> by David
          </p>
        </div>
      </div>
    </footer>
  );
};
