import { BookOpen, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 gradient-header text-primary-foreground shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-primary-foreground hover:bg-white/20"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight md:text-2xl">
                ગુજરાતી AI શિક્ષક
              </h1>
              <p className="hidden text-xs opacity-90 md:block">
                તમારો અંગત શિક્ષણ સહાયક
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-sm backdrop-blur-sm md:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent"></span>
            <span>ઓનલાઇન</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
