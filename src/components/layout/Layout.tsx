import { TooltipProvider } from "@/components/ui/tooltip";
import { Aside } from "./Aside";
import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <TooltipProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <Aside />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto bg-accent p-6">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
