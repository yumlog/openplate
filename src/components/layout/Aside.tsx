import { useState, useEffect } from "react";
import { flushSync } from "react-dom";
import {
  Map,
  Clock,
  LayoutGrid,
  ArrowLeft,
  ArrowRight,
  Tag,
  Image,
  PencilRuler,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const menuItems: MenuItem[] = [
  { icon: <Clock className="size-5" />, label: "타임라인", href: "/timeline" },
  { icon: <Map className="size-5" />, label: "지도", href: "/map" },
  {
    icon: <LayoutGrid className="size-5" />,
    label: "커버리지",
    href: "/coverage",
  },
  {
    icon: <Tag className="size-5" />,
    label: "ROI 라벨링",
    href: "/roi-labeling",
  },
  {
    icon: <PencilRuler className="size-5" />,
    label: "ROI 에디터",
    href: "/roi-editor",
  },
  {
    icon: <Image className="size-5" />,
    label: "Reference 빌더",
    href: "/reference-builder",
  },
];

export function Aside() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let rafId: number;
    let timerId: number;

    if (isModalOpen) {
      flushSync(() => {
        setIsAnimating(false);
        setIsModalVisible(true);
      });
      rafId = requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      timerId = window.setTimeout(() => {
        setIsModalVisible(false);
      }, 200);
    }

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
    };
  }, [isModalOpen]);

  return (
    <>
      <aside className="flex flex-col h-full w-16 bg-background border-r">
        <NavLink to="/" className="flex items-center justify-center h-15">
          <div className="size-8 bg-primary rounded-md flex items-center justify-center font-bold text-primary-foreground text-sm">
            OP
          </div>
        </NavLink>

        <nav className="flex-1 flex flex-col items-center gap-6 py-4">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "inline-flex items-center justify-center size-8 rounded-lg text-secondary-foreground hover:text-foreground hover:bg-accent",
                  isActive && "text-foreground",
                )
              }
            >
              {item.icon}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* 모달 */}
      {isModalVisible && (
        <div
          className={cn(
            "fixed left-0 top-0 h-full bg-background border-r z-50 flex flex-col overflow-hidden transition-[width] duration-300 ease-in-out",
            isAnimating ? "w-50" : "w-16",
          )}
        >
          <div className="flex items-center h-15 px-4">
            <NavLink
              to="/"
              className="flex items-center gap-2"
              onClick={() => setIsModalOpen(false)}
            >
              <div className="size-8 bg-primary rounded-md flex items-center justify-center font-bold text-primary-foreground text-sm shrink-0">
                OP
              </div>
              <span className="text-foreground font-semibold whitespace-nowrap">
                OpenPlate
              </span>
            </NavLink>
          </div>

          <nav className="flex-1 flex flex-col gap-6 px-2 py-4">
            {menuItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.href}
                onClick={() => setIsModalOpen(false)}
              >
                {({ isActive }) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start text-secondary-foreground hover:text-foreground hover:bg-accent whitespace-nowrap",
                      isActive && "text-foreground font-medium",
                    )}
                  >
                    {item.label}
                  </Button>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {/* 토글 버튼 - 고정 위치 */}
      <Button
        variant="outline"
        size="icon-sm"
        className="fixed left-4 bottom-4 z-50 rounded-full text-muted-foreground"
        onClick={() => setIsModalOpen(!isModalOpen)}
      >
        {isModalOpen ? (
          <ArrowLeft className="size-6" />
        ) : (
          <ArrowRight className="size-6" />
        )}
      </Button>
    </>
  );
}
