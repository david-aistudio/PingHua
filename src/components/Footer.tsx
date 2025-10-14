import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
              DonghuaK!ta
            </h3>
            <p className="text-sm text-muted-foreground">
              Your premier destination for watching Chinese animation (Donghua) with subtitle Indonesia.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/ongoing" className="text-muted-foreground hover:text-primary transition-colors">
                  Ongoing
                </Link>
              </li>
              <li>
                <Link to="/completed" className="text-muted-foreground hover:text-primary transition-colors">
                  Completed
                </Link>
              </li>
            </ul>
          </div>

          {/* Browse */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Browse</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/genres" className="text-muted-foreground hover:text-primary transition-colors">
                  All Genres
                </Link>
              </li>
              <li>
                <Link to="/by-year" className="text-muted-foreground hover:text-primary transition-colors">
                  By Year
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">About</h4>
            <p className="text-sm text-muted-foreground">
              DonghuaK!ta provides free streaming of Chinese animation with Indonesian subtitles. All content belongs to their respective owners.
            </p>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} DonghuaK!ta. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
