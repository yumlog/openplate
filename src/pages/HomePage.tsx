import { Link } from "react-router-dom";
import {
  Map,
  LayoutGrid,
  Tag,
  Image,
  PencilRuler,
  CircleDot,
} from "lucide-react";

const menuItems = [
  {
    icon: <Map className="size-5" />,
    label: "지도",
    href: "/map",
    description: "위치 데이터 시각화",
  },
  {
    icon: <LayoutGrid className="size-5" />,
    label: "커버리지",
    href: "/coverage",
    description: "범위 현황 확인",
  },
  {
    icon: <Tag className="size-5" />,
    label: "ROI 라벨링",
    href: "/roi-labeling",
    description: "관심 영역 라벨링",
  },
  {
    icon: <PencilRuler className="size-5" />,
    label: "ROI 에디터",
    href: "/roi-editor",
    description: "관심 영역 편집",
  },
  {
    icon: <Image className="size-5" />,
    label: "Reference 빌더",
    href: "/reference-builder",
    description: "참조 이미지 생성",
  },
  {
    icon: <CircleDot className="size-5" />,
    label: "SPOT 에디터",
    href: "/spot-editor",
    description: "SPOT 기반 점유 감지 설정",
  },
];

export function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">홈</h1>
      <p className="text-muted-foreground">OpenPlate에 오신 것을 환영합니다.</p>
      <div className="grid grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="p-6 bg-background rounded-lg border hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              {item.icon}
              <h3 className="font-semibold text-foreground">{item.label}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
