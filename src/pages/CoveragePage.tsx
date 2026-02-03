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
  const [imageRatio, setImageRatio] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMapDragging, setIsMapDragging] = useState(false);
  const [showUnmatched, setShowUnmatched] = useState(false);

  const dragStartRef = useRef({ x: 0, y: 0 });
  const positionStartRef = useRef({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const originalColorsRef = useRef<Map<string, string>>(new Map());

  const getSvg = () => svgContainerRef.current?.querySelector("svg");
  const currentCctvLabel =
    cctvOptions.find((c) => c.value === selectedCctv)?.label || "";
  const selectedIds = [...direction1Selection, ...direction2Selection];

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

  // 주차칸 클릭/호버 이벤트
  useEffect(() => {
    const svg = getSvg();
    if (!svg) return;

    const handleClick = (e: Event) => {
      const target = e.currentTarget as SVGElement;
      const id = target.getAttribute("data-parking-id");
      if (!id) return;

      const fill = target.getAttribute("fill") || "";
      const isDir1 = fill === "#ad46ff";
      const isDir2 = fill === "#00d5be";

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
        selectedDirection === 1 ? "#ad46ff" : "#00d5be",
      );
      (selectedDirection === 1
        ? setDirection1Selection
        : setDirection2Selection)((prev) => [...prev, id]);
    };

    const handleEnter = (e: Event) =>
      ((e.currentTarget as SVGElement).style.opacity = "0.8");
    const handleLeave = (e: Event) =>
      ((e.currentTarget as SVGElement).style.opacity = "1");

    const elements = svg.querySelectorAll("[data-parking-id]");
    elements.forEach((el) => {
      (el as HTMLElement).style.cursor = "pointer";
      (el as HTMLElement).style.pointerEvents = "auto";
      el.addEventListener("click", handleClick);
      el.addEventListener("mouseenter", handleEnter);
      el.addEventListener("mouseleave", handleLeave);
    });

    return () =>
      elements.forEach((el) => {
        el.removeEventListener("click", handleClick);
        el.removeEventListener("mouseenter", handleEnter);
        el.removeEventListener("mouseleave", handleLeave);
      });
  }, [selectedDirection]);

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

  const handleReset = () => {
    const svg = getSvg();
    if (svg) {
      selectedIds.forEach((id) => {
        const el = svg.querySelector(`[data-parking-id="${id}"]`);
        if (el)
          el.setAttribute("fill", originalColorsRef.current.get(id) || "");
      });
    }
    setDirection1Selection([]);
    setDirection2Selection([]);
    setShowUnmatched(false);
  };

  const handleToggleUnmatched = () => {
    const svg = getSvg();
    if (!svg) return;

    svg.querySelectorAll("[data-parking-id]").forEach((el) => {
      const id = el.getAttribute("data-parking-id");
      if (!id || selectedIds.includes(id)) return;

      if (!showUnmatched) {
        if (!originalColorsRef.current.has(id)) {
          originalColorsRef.current.set(id, el.getAttribute("fill") || "");
        }
        el.setAttribute("fill", "#ffdf20");
      } else {
        el.setAttribute("fill", originalColorsRef.current.get(id) || "");
      }
    });
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
          size="icon"
          onClick={() => handleCctvChange(-1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleCctvChange(1)}
        >
          <ChevronRight className="size-4" />
        </Button>

        <Button
          onClick={() =>
            console.log("저장:", { direction1Selection, direction2Selection })
          }
        >
          <Save className="size-4" />
          저장
        </Button>

        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="size-4" />
          초기화
        </Button>

        <Button
          variant={showUnmatched ? "default" : "outline"}
          onClick={handleToggleUnmatched}
        >
          <EyeOff className="size-4" />
          미매칭 표시
        </Button>
      </div>

      {/* 하단 컨텐츠 */}
      <div className="flex flex-1 gap-3 overflow-hidden">
        {/* 좌측: CCTV 이미지 */}
        <div className="flex flex-1 flex-col gap-5 rounded-xl border bg-background p-5">
          <h3 className="text-base font-semibold text-foreground">
            {currentCctvLabel}
          </h3>

          <div className="flex flex-col gap-1">
            <span className="text-sm text-foreground">방향1 (상단)</span>
            <div
              className="overflow-hidden rounded-lg border"
              style={imageRatio ? { aspectRatio: imageRatio } : undefined}
            >
              <img
                src={cctvImage}
                alt="CCTV 방향1"
                className="w-full"
                onLoad={(e) => {
                  const { naturalWidth, naturalHeight } = e.currentTarget;
                  setImageRatio(naturalWidth / (naturalHeight / 2));
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm text-foreground">방향2 (하단)</span>
            <div
              className="overflow-hidden rounded-lg border"
              style={imageRatio ? { aspectRatio: imageRatio } : undefined}
            >
              <img
                src={cctvImage}
                alt="CCTV 방향2"
                className="w-full -translate-y-1/2"
              />
            </div>
          </div>
        </div>

        {/* 우측: 지도-주차칸 선택 */}
        <div className="flex flex-1 flex-col gap-5 rounded-xl border bg-background p-5">
          <h3 className="text-base font-semibold text-foreground">
            주차칸 선택
          </h3>

          <div className="flex gap-2">
            <Button
              variant={selectedDirection === 1 ? "default" : "outline"}
              onClick={() => setSelectedDirection(1)}
              className="flex-1"
            >
              방향1
            </Button>
            <Button
              variant={selectedDirection === 2 ? "default" : "outline"}
              onClick={() => setSelectedDirection(2)}
              className="flex-1"
            >
              방향2
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

            <div className="absolute right-3 top-3 flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setZoom((p) => Math.min(p + 10, 500))}
              >
                <ZoomIn className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setZoom((p) => Math.max(p - 10, 50))}
              >
                <ZoomOut className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setZoom(100);
                  setPosition({ x: 0, y: 0 });
                }}
              >
                <RotateCcw className="size-4" />
              </Button>
              <div className="flex h-9 items-center justify-center rounded-md border bg-background px-2 text-center text-sm text-foreground tabular-nums">
                {zoom}%
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground tabular-nums">방향1:</span>
              <div className="flex flex-wrap gap-1">
                {direction1Selection.length > 0 ? (
                  direction1Selection.map((id) => (
                    <Badge key={id} className="bg-[#ad46ff] tabular-nums">
                      {id}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline">미선택</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground tabular-nums">방향2:</span>
              <div className="flex flex-wrap gap-1">
                {direction2Selection.length > 0 ? (
                  direction2Selection.map((id) => (
                    <Badge key={id} className="bg-[#00d5be] tabular-nums">
                      {id}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline">미선택</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
