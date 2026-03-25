import { Cpu } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-glass-border/20 py-8 px-4">
    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 font-display text-sm font-bold gradient-text">
        <Cpu className="w-4 h-4 text-primary" />
        Suganesh Ranganathan
      </div>
      <p className="font-body text-xs text-muted-foreground">
        © {new Date().getFullYear()} — Built with passion for embedded systems
      </p>
    </div>
  </footer>
);

export default Footer;
