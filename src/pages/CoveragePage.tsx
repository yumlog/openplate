import { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  RotateCcw,
  EyeOff,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import cctvImage from "@/assets/cctv.jpg";
import MapSvg from "@/assets/map.svg?react";

const floorOptions = [
  { value: "b3", label: "B3" },
  { value: "b2", label: "B2" },
  { value: "b1", label: "B1" },
];

export function CoveragePage() {
  const [selectedFloor, setSelectedFloor] = useState("b1");
  const [selectedCctv, setSelectedCctv] = useState("");
  const [selectedDirection, setSelectedDirection] = useState<1 | 2>(1);
  const [direction1Selection, setDirection1Selection] = useState<string[]>([]);
  const [direction2Selection, setDirection2Selection] = useState<string[]>([]);
  const [cctvOptions, setCctvOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [zoom, setZoom] = useState(100);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMapDragging, setIsMapDragging] = useState(false);
  const [showUnmatched, setShowUnmatched] = useState(false);
  const [saveAlertOpen, setSaveAlertOpen] = useState(false);

  const dragStartRef = useRef({ x: 0, y: 0 });
  const positionStartRef = useRef({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const originalColorsRef = useRef<Map<string, string>>(new Map());

  const getSvg = () => svgContainerRef.current?.querySelector("svg");
  const currentCctvLabel =
    cctvOptions.find((c) => c.value === selectedCctv)?.label || "";
  const selectedIds = [...direction1Selection, ...direction2Selection];
  const unmatchedCount =
    getSvg()?.querySelectorAll("[data-unmatched-overlay]").length ?? 0;

  // SVG 초기화: CCTV 목록 추출
  useEffect(() => {
    const svg = getSvg();
    if (!svg) return;

    const options = Array.from(
      svg.querySelectorAll("[inkscape\\:label^='ID ']"),
    )
      .map((el) => {
        const id = el.getAttribute("inkscape:label")?.replace("ID ", "") || "";
        return { value: id, label: `CCTV ${id}` };
      })
      .sort((a, b) => parseInt(a.value) - parseInt(b.value));

    setCctvOptions(options);
    if (options.length > 0 && !selectedCctv) setSelectedCctv(options[0].value);
  }, []);

  // CCTV로 지도 이동 (500% 확대 후 지도 컨테이너 중앙 정렬)
  useEffect(() => {
    if (!selectedCctv) return;
    const svgContainer = svgContainerRef.current;
    const container = mapContainerRef.current;
    const cctvEl = svgContainer?.querySelector(
      `[inkscape\\:label="ID ${selectedCctv}"]`,
    );

    if (!cctvEl || !container || !svgContainer) return;

    // 일시적으로 transform 초기화해서 기준 위치 계산
    const originalTransform = svgContainer.style.transform;
    svgContainer.style.transform = "translate(0px, 0px) scale(1)";
    svgContainer.getBoundingClientRect(); // 강제 리플로우

    // 컨테이너 중앙과 CCTV 중앙 사이의 거리 계산
    const containerRect = container.getBoundingClientRect();
    const cctvRect = cctvEl.getBoundingClientRect();
    const distX =
      containerRect.left +
      containerRect.width / 2 -
      (cctvRect.left + cctvRect.width / 2);
    const distY =
      containerRect.top +
      containerRect.height / 2 -
      (cctvRect.top + cctvRect.height / 2);

    svgContainer.style.transform = originalTransform;

    // 500% 확대 시 이동 거리 적용
    setZoom(500);
    setPosition({ x: distX * 5, y: distY * 5 });
  }, [selectedCctv]);

  // 휠 줌
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom((prev) =>
        Math.min(Math.max(prev + (e.deltaY < 0 ? 10 : -10), 50), 500),
      );
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  // CSS 스타일 주입 (마운트 시 한 번만)
  useEffect(() => {
    const styleId = "parking-style";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      [data-parking-id] { cursor: pointer; pointer-events: auto; }
      [data-parking-id]:hover { opacity: 0.85 !important; }
      @keyframes unmatched-blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
      [data-unmatched-overlay] { animation: unmatched-blink 2s ease-in-out infinite; }
    `;
    document.head.appendChild(style);
  }, []);

  // 주차칸 클릭 이벤트 및 opacity 조절
  useEffect(() => {
    const svg = getSvg();
    if (!svg) return;

    const elements = svg.querySelectorAll("[data-parking-id]");
    const selected = [...direction1Selection, ...direction2Selection];

    // opacity 조절
    elements.forEach((el) => {
      const id = el.getAttribute("data-parking-id");
      if (!id) return;
      (el as HTMLElement).style.opacity =
        selected.length > 0 && !selected.includes(id) ? "0.7" : "1";
    });

    // 클릭 이벤트
    const handleClick = (e: Event) => {
      const target = e.currentTarget as SVGElement;
      const id = target.getAttribute("data-parking-id");
      if (!id) return;

      const fill = target.getAttribute("fill") || "";
      const isDir1 = fill === "#FF8C00";
      const isDir2 = fill === "#262626";

      if (isDir1 || isDir2) {
        target.setAttribute("fill", originalColorsRef.current.get(id) || "");
        (isDir1 ? setDirection1Selection : setDirection2Selection)((prev) =>
          prev.filter((x) => x !== id),
        );
        return;
      }

      if (!originalColorsRef.current.has(id)) {
        originalColorsRef.current.set(id, fill);
      }

      target.setAttribute(
        "fill",
        selectedDirection === 1 ? "#FF8C00" : "#262626",
      );

      (selectedDirection === 1
        ? setDirection1Selection
        : setDirection2Selection)((prev) => [...prev, id]);
    };

    elements.forEach((el) => el.addEventListener("click", handleClick));
    return () =>
      elements.forEach((el) => el.removeEventListener("click", handleClick));
  }, [selectedDirection, direction1Selection, direction2Selection]);

  const handleMapMouseDown = (e: React.MouseEvent) => {
    setIsMapDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    positionStartRef.current = position;
  };

  const handleMapMouseMove = (e: React.MouseEvent) => {
    if (!isMapDragging) return;
    setPosition({
      x: positionStartRef.current.x + e.clientX - dragStartRef.current.x,
      y: positionStartRef.current.y + e.clientY - dragStartRef.current.y,
    });
  };

  const handleCctvChange = (delta: number) => {
    const idx = cctvOptions.findIndex((c) => c.value === selectedCctv);
    const newIdx = idx + delta;
    if (newIdx >= 0 && newIdx < cctvOptions.length) {
      setSelectedCctv(cctvOptions[newIdx].value);
    }
  };

  const clearOverlays = () => {
    getSvg()
      ?.querySelectorAll("[data-unmatched-overlay]")
      .forEach((el) => el.remove());
  };

  const handleReset = () => {
    const svg = getSvg();
    if (svg) {
      selectedIds.forEach((id) => {
        const el = svg.querySelector(`[data-parking-id="${id}"]`);
        if (el)
          el.setAttribute("fill", originalColorsRef.current.get(id) || "");
      });
      clearOverlays();
    }
    setDirection1Selection([]);
    setDirection2Selection([]);
    setShowUnmatched(false);
  };

  const handleToggleUnmatched = () => {
    const svg = getSvg();
    if (!svg) return;

    if (showUnmatched) {
      clearOverlays();
    } else {
      svg.querySelectorAll("[data-parking-id]").forEach((el) => {
        const id = el.getAttribute("data-parking-id");
        if (!id || selectedIds.includes(id)) return;

        const overlay = el.cloneNode(false) as SVGElement;
        Object.entries({
          fill: "#FEF08A",
          "fill-opacity": "0.4",
          stroke: "#FEF08A",
          "stroke-width": "1.5",
          rx: "2",
          ry: "2",
          "data-unmatched-overlay": id,
          "pointer-events": "none",
        }).forEach(([k, v]) => overlay.setAttribute(k, v));
        overlay.removeAttribute("data-parking-id");
        overlay.removeAttribute("id");
        el.insertAdjacentElement("afterend", overlay);
      });
    }
    setShowUnmatched(!showUnmatched);
  };

  return (
    <div className="flex h-full flex-col gap-5">
      <h2 className="text-[28px] text-foreground font-bold">커버리지</h2>

      {/* 상단 검색 폼 */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <Label>층</Label>
          <Select value={selectedFloor} onValueChange={setSelectedFloor}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="층 선택" />
            </SelectTrigger>
            <SelectContent>
              {floorOptions.map((floor) => (
                <SelectItem key={floor.value} value={floor.value}>
                  {floor.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label>CCTV</Label>
          <Select value={selectedCctv} onValueChange={setSelectedCctv}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="CCTV 선택" />
            </SelectTrigger>
            <SelectContent>
              {cctvOptions.map((cctv) => (
                <SelectItem key={cctv.value} value={cctv.value}>
                  {cctv.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="icon-lg"
          onClick={() => handleCctvChange(-1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-lg"
          onClick={() => handleCctvChange(1)}
        >
          <ChevronRight className="size-4" />
        </Button>

        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="size-4" />
          초기화
        </Button>

        <Button onClick={() => setSaveAlertOpen(true)}>
          <Save className="size-4" />
          저장
        </Button>
      </div>

      {/* 하단 컨텐츠 */}
      <div className="flex flex-1 gap-3 overflow-hidden">
        {/* 좌측: CCTV 이미지 */}
        <div className="flex flex-1 flex-col gap-5 rounded-xl border bg-background px-4 py-5">
          <h3 className="flex items-center gap-2 text-base font-bold text-foreground leading-tight">
            {floorOptions.find((f) => f.value === selectedFloor)?.label}
            <Separator orientation="vertical" className="h-3" />
            {currentCctvLabel}
          </h3>

          <div className="relative">
            <img
              src={cctvImage}
              alt="CCTV 이미지"
              className="w-full rounded-lg"
            />
            <span className="absolute top-2 left-2 flex items-center justify-center rounded-sm bg-primary/80 px-2 py-1 text-center text-xs text-secondary tabular-nums">
              방향1 (상단)
            </span>
            <span className="absolute top-[calc(50%+8px)] left-2 flex items-center justify-center rounded-sm bg-primary/80 px-2 py-1 text-center text-xs text-secondary tabular-nums">
              방향2 (하단)
            </span>
          </div>
        </div>

        {/* 우측: 지도-주차칸 선택 */}
        <div className="flex flex-1 flex-col rounded-xl border bg-background px-4 py-5">
          <div className="flex items-center gap-2">
            <h3 className="flex items-center gap-2 text-base font-bold text-foreground leading-tight">
              주차칸 선택
            </h3>
            {showUnmatched && (
              <>
                <Separator orientation="vertical" className="h-3" />
                <span className="text-sm font-normal text-muted-foreground">
                  미매칭: {unmatchedCount}개
                </span>
              </>
            )}
          </div>

          <div className="flex gap-2 mt-5 mb-4">
            <Button
              variant={selectedDirection === 1 ? "default" : "outline"}
              onClick={() => setSelectedDirection(1)}
            >
              방향1 선택
            </Button>
            <Button
              variant={selectedDirection === 2 ? "default" : "outline"}
              onClick={() => setSelectedDirection(2)}
            >
              방향2 선택
            </Button>
            <Button
              variant={showUnmatched ? "default" : "outline"}
              onClick={handleToggleUnmatched}
            >
              <EyeOff className="size-4" />
              미매칭 표시
            </Button>
          </div>

          <div
            ref={mapContainerRef}
            className="relative flex-1 overflow-hidden rounded-lg border"
            onMouseDown={handleMapMouseDown}
            onMouseMove={handleMapMouseMove}
            onMouseUp={() => setIsMapDragging(false)}
            onMouseLeave={() => setIsMapDragging(false)}
            style={{ cursor: isMapDragging ? "grabbing" : "grab" }}
          >
            <div
              ref={svgContainerRef}
              className="flex h-full w-full items-center justify-center"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom / 100})`,
                transformOrigin: "center center",
              }}
            >
              <MapSvg className="max-h-full max-w-full select-none" />
            </div>

            <div className="absolute right-2 bottom-2 flex flex-col items-end gap-1">
              <Button
                variant="outline"
                size="icon-lg"
                onClick={() => setZoom((p) => Math.min(p + 10, 500))}
                className="bg-background/80 backdrop-blur-[1px]"
              >
                <ZoomIn className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-lg"
                onClick={() => setZoom((p) => Math.max(p - 10, 50))}
                className="bg-background/80 backdrop-blur-[1px]"
              >
                <ZoomOut className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-lg"
                onClick={() => {
                  setZoom(100);
                  setPosition({ x: 0, y: 0 });
                }}
                className="bg-background/80 backdrop-blur-[1px]"
              >
                <RotateCcw className="size-4" />
              </Button>
              <div className="flex h-9 items-center justify-center rounded-md border bg-background/80 backdrop-blur-[1px] px-2 text-center text-sm text-foreground tabular-nums">
                {zoom}%
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-6.5">
            {[
              { label: "방향1", ids: direction1Selection, color: "#FF8C00" },
              { label: "방향2", ids: direction2Selection, color: "#262626" },
            ].map(({ label, ids, color }) => (
              <div key={label} className="flex items-center gap-1">
                <span className="text-sm text-foreground font-medium tabular-nums">
                  {label}:
                </span>
                <div className="flex flex-wrap gap-1">
                  {ids.length > 0 ? (
                    ids.map((id) => (
                      <Badge
                        key={id}
                        size="sm"
                        style={{ backgroundColor: color }}
                      >
                        {id}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" size="sm">
                      미선택
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 저장 확인 다이얼로그 */}
      <AlertDialog open={saveAlertOpen} onOpenChange={setSaveAlertOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>저장</AlertDialogTitle>
            <AlertDialogDescription>저장하시겠습니까?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
