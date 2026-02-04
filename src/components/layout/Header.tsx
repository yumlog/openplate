import { useLocation, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

const routeLabels: Record<string, string> = {
  "/": "홈",
  "/map": "지도",
  "/timeline": "타임라인",
  "/coverage": "커버리지",
  "/roi-labeling": "ROI 라벨링",
  "/reference-builder": "Reference 빌더",
  "/roi-editor": "ROI 에디터",
  "/spot-editor": "SPOT 에디터",
};

export function Header() {
  const location = useLocation();
  const currentLabel = routeLabels[location.pathname] || "홈";
  const isHome = location.pathname === "/";

  return (
    <header className="flex items-center justify-between h-15 px-6 border-b bg-background">
      <nav className="flex items-center gap-2.5 text-sm">
        <Link to="/" className="text-muted-foreground">
          홈
        </Link>
        {!isHome && (
          <>
            <ChevronRight className="size-4 text-muted-foreground" />
            <span className="text-foreground font-medium">{currentLabel}</span>
          </>
        )}
      </nav>

      <Avatar className="size-8">
        <AvatarFallback className="border bg-background text-foreground">
          <User className="size-4" />
        </AvatarFallback>
      </Avatar>
    </header>
  );
}
