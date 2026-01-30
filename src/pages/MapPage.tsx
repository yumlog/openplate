import { useState, useRef, useCallback, useEffect } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Search, ZoomIn, ZoomOut, RotateCcw, CalendarIcon } from "lucide-react";
import MapSvg from "@/assets/map.svg?react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// 주차 데이터 타입
interface ParkingSpot {
  parkingId: string;
  plateNumber: string;
  location: string;
  parkedAt: Date;
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

function formatDateTime(date: Date): string {
  return format(date, "yyyy/MM/dd HH:mm:ss");
}

// 샘플 주차 데이터
const sampleParkingData: ParkingSpot[] = [
  {
    parkingId: "P262",
    plateNumber: "00가0000",
    location: "B2/P262",
    parkedAt: new Date(),
  },
  {
    parkingId: "P392",
    plateNumber: "12나3456",
    location: "B2/P392",
    parkedAt: new Date(),
  },
];

export function MapPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<number[]>([720]);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMapDragging, setIsMapDragging] = useState(false);
  const [hoveredSpot, setHoveredSpot] = useState<ParkingSpot | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [cctvModalOpen, setCctvModalOpen] = useState(false);
  const [selectedCctv, setSelectedCctv] = useState<string | null>(null);
  const [cctvViewMode, setCctvViewMode] = useState<"original" | "roi">(
    "original",
  );
  const dragStartRef = useRef({ x: 0, y: 0 });
  const positionStartRef = useRef({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  const now = new Date();

  // 주차 위치로 지도 이동
  const moveToParkingSpot = useCallback(
    (parkingId: string) => {
      const svgElement = svgContainerRef.current?.querySelector("svg");
      const parkingElement = svgElement?.querySelector(
        `[data-parking-id="${parkingId}"]`,
      );
      const containerElement = mapContainerRef.current;

      if (!parkingElement || !containerElement || !svgElement) return;

      const parkingRect = parkingElement.getBoundingClientRect();
      const containerRect = containerElement.getBoundingClientRect();

      // 주차 위치 중심
      const parkingCenterX = parkingRect.left + parkingRect.width / 2;
      const parkingCenterY = parkingRect.top + parkingRect.height / 2;

      // 컨테이너 중심
      const containerCenterX = containerRect.left + containerRect.width / 2;
      const containerCenterY = containerRect.top + containerRect.height / 2;

      // 주차 위치를 컨테이너 중심으로 이동시키기 위한 새 position 계산
      const newX = position.x + (containerCenterX - parkingCenterX);
      const newY = position.y + (containerCenterY - parkingCenterY);

      setPosition({ x: newX, y: newY });
    },
    [zoom, position],
  );

  // SVG 주차 영역에 이벤트 바인딩
  useEffect(() => {
    const svgElement = svgContainerRef.current?.querySelector("svg");
    if (!svgElement) return;

    const handleMouseEnter = (e: Event) => {
      const target = e.target as Element;
      const parkingId = target.getAttribute("data-parking-id");
      if (!parkingId) return;

      const spot = sampleParkingData.find((s) => s.parkingId === parkingId);
      if (spot) {
        setHoveredSpot(spot);
        const rect = target.getBoundingClientRect();
        setTooltipPosition({
          x: rect.left + rect.width / 2,
          y: rect.top,
        });
      }
    };

    const handleMouseLeave = (e: Event) => {
      const target = e.target as Element;
      if (target.getAttribute("data-parking-id")) {
        setHoveredSpot(null);
      }
    };

    // data-parking-id 속성이 있는 모든 요소에 이벤트 추가
    const parkingElements = svgElement.querySelectorAll("[data-parking-id]");
    parkingElements.forEach((el) => {
      (el as HTMLElement).style.cursor = "pointer";
      (el as HTMLElement).style.pointerEvents = "auto";
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    // CCTV 요소 클릭 이벤트 (inkscape:label이 "ID xxx" 형식인 요소)
    const cctvElements = svgElement.querySelectorAll(
      "[inkscape\\:label^='ID ']",
    );
    const handleCctvClick = (e: Event) => {
      const target = e.currentTarget as Element;
      const label = target.getAttribute("inkscape:label");
      if (label) {
        const cctvId = label.replace("ID ", "");
        setSelectedCctv(cctvId);
        setCctvModalOpen(true);
      }
    };

    cctvElements.forEach((el) => {
      (el as HTMLElement).style.cursor = "pointer";
      (el as HTMLElement).style.pointerEvents = "auto";
      el.addEventListener("click", handleCctvClick);
    });

    return () => {
      parkingElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
      cctvElements.forEach((el) => {
        el.removeEventListener("click", handleCctvClick);
      });
    };
  }, []);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 500));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  const handleZoomReset = () => {
    setZoom(100);
    setPosition({ x: 0, y: 0 });
  };

  const handleMapMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsMapDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      positionStartRef.current = { x: position.x, y: position.y };
    },
    [position],
  );

  const handleMapMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isMapDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPosition({
        x: positionStartRef.current.x + dx,
        y: positionStartRef.current.y + dy,
      });
    },
    [isMapDragging],
  );

  const handleMapMouseUp = useCallback(() => {
    setIsMapDragging(false);
  }, []);

  const handleMapMouseLeave = useCallback(() => {
    setIsMapDragging(false);
  }, []);

  // 휠 이벤트를 useEffect로 바인딩하여 passive: false 옵션 사용
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        setZoom((prev) => Math.min(prev + 10, 500));
      } else {
        setZoom((prev) => Math.max(prev - 10, 50));
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <div className="flex h-full flex-col gap-3">
      {/* 상단 카드 리스트 */}
      <div className="flex items-center gap-3">
        <div className="h-33 flex flex-col justify-between flex-1 rounded-xl border shadow-xs bg-background p-5">
          <p className="text-base text-foreground">입주민 주차 중</p>
          <p className="text-4xl text-foreground font-semibold">86</p>
          <p className="text-xs text-muted-foreground">
            {formatDateTime(now)} 기준
          </p>
        </div>
        <div className="h-33 flex flex-col justify-between flex-1 rounded-xl border shadow-xs bg-background p-5">
          <p className="text-base text-foreground">방문객 주차 중</p>
          <p className="text-4xl text-foreground font-semibold">62</p>
          <p className="text-xs text-muted-foreground">
            {formatDateTime(now)} 기준
          </p>
        </div>
        <div className="h-33 flex flex-col justify-between flex-1 rounded-xl border shadow-xs bg-background p-5">
          <p className="text-base text-foreground">미확인 주차 중</p>
          <p className="text-4xl text-foreground font-semibold">29</p>
          <p className="text-xs text-muted-foreground">
            {formatDateTime(now)} 기준
          </p>
        </div>
        <div className="h-33 flex flex-col justify-between flex-1 rounded-xl border shadow-xs bg-background p-5">
          <p className="text-base text-foreground">빈 주차 칸</p>
          <p className="text-4xl text-foreground font-semibold">12</p>
          <p className="text-xs text-muted-foreground">
            {formatDateTime(now)} 기준
          </p>
        </div>
        <div className="h-33 flex flex-col justify-center items-center flex-1 rounded-xl border shadow-xs bg-black p-5">
          <p className="flex items-center gap-1 text-4xl font-semibold text-neutral-400">
            <span className="text-primary">234</span>
            <span>/</span>
            <span>491</span>
          </p>
        </div>
      </div>

      {/* 검색 폼 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* 일자 데이트피커 */}
          <Popover>
            <PopoverTrigger className="inline-flex h-9 w-36 items-center justify-start gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              <CalendarIcon className="size-4" />
              {date ? format(date, "yyyy-MM-dd", { locale: ko }) : "날짜 선택"}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={ko}
              />
            </PopoverContent>
          </Popover>

          {/* 층 셀렉트 */}
          <Select defaultValue="b1">
            <SelectTrigger className="w-24">
              <SelectValue placeholder="층 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="b3">B3</SelectItem>
              <SelectItem value="b2">B2</SelectItem>
              <SelectItem value="b1">B1</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          {/* 슬라이더 */}
          <span className="text-xs text-muted-foreground">00:00</span>
          <div className="relative">
            <Slider
              value={time}
              onValueChange={(value) => {
                setTime(value);
                setIsDragging(true);
              }}
              onValueCommit={() => setIsDragging(false)}
              min={0}
              max={1440}
              step={30}
              className="w-48"
            />
            {isDragging && (
              <div
                className="absolute -top-8 rounded-sm bg-primary-foreground px-3 py-1.5 text-xs text-primary font-bold"
                style={{
                  left: `calc(${(time[0] / 1440) * 100}% + ${8 - (time[0] / 1440) * 16}px)`,
                  transform: "translateX(-50%)",
                }}
              >
                {formatTime(time[0])}
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground">24:00</span>

          {/* 차량검색 인풋 */}
          <Input placeholder="차량번호 입력" className="w-36" />

          {/* 검색 버튼 */}
          <Button>
            <Search className="size-4" />
            검색
          </Button>
        </div>
      </div>

      {/* 메인 영역: 조회 폼 + 지도 */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* 좌측 조회 폼 */}
        <div className="flex w-64 shrink-0 flex-col gap-4 overflow-y-auto rounded-lg border bg-background p-4">
          {/* 입주민 조회 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">입주민 조회</h3>
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="동" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="101">101동</SelectItem>
                  <SelectItem value="102">102동</SelectItem>
                  <SelectItem value="103">103동</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="층/호" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="101">101호</SelectItem>
                  <SelectItem value="102">102호</SelectItem>
                  <SelectItem value="201">201호</SelectItem>
                  <SelectItem value="202">202호</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 보유 차량 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">보유 차량</h3>
            <div className="space-y-2">
              {sampleParkingData.map((spot) => (
                <Button
                  key={spot.parkingId}
                  variant="outline"
                  className="h-auto w-full flex-col items-start p-3"
                  onClick={() => moveToParkingSpot(spot.parkingId)}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-medium text-foreground">
                      {spot.plateNumber}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {spot.location}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateTime(spot.parkedAt)}
                  </p>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* 우측 지도 영역 */}
        <div
          ref={mapContainerRef}
          className="relative flex-1 overflow-hidden rounded-lg border bg-background"
          onMouseDown={handleMapMouseDown}
          onMouseMove={handleMapMouseMove}
          onMouseUp={handleMapMouseUp}
          onMouseLeave={handleMapMouseLeave}
          style={{ cursor: isMapDragging ? "grabbing" : "grab" }}
        >
          {/* 지도 SVG 영역 */}
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

          {/* 주차 위치 툴팁 */}
          {hoveredSpot && (
            <div
              className="pointer-events-none fixed z-50 flex flex-col items-center"
              style={{
                left: tooltipPosition.x,
                top: tooltipPosition.y - 8,
                transform: "translate(-50%, -100%)",
              }}
            >
              <div className="rounded-md bg-foreground px-3 py-1.5 text-xs font-bold text-background">
                {hoveredSpot.parkingId} (차량 있음)
              </div>
              <div className="size-0 border-x-6 border-t-6 border-x-transparent border-t-foreground" />
            </div>
          )}

          {/* 우측 상단 컨트롤 */}
          <div className="absolute right-4 top-4 flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomIn}
              className="bg-background"
            >
              <ZoomIn className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomOut}
              className="bg-background"
            >
              <ZoomOut className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomReset}
              className="bg-background"
            >
              <RotateCcw className="size-4" />
            </Button>
            <div className="flex h-9 items-center justify-center rounded-md border bg-background px-2 text-center text-sm text-foreground tabular-nums">
              {zoom}%
            </div>
          </div>

          {/* 좌측 하단 범례 */}
          <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-md border bg-background px-3 py-2">
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded-full bg-blue-500" />
              <span className="text-xs text-foreground">입주민</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded-full bg-yellow-500" />
              <span className="text-xs text-foreground">방문차량</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded-full bg-gray-400" />
              <span className="text-xs text-foreground">인식불가</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded-full bg-green-500" />
              <span className="text-xs text-foreground">빈자리</span>
            </div>
          </div>
        </div>
      </div>

      {/* CCTV 모달 */}
      <Dialog open={cctvModalOpen} onOpenChange={setCctvModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>CCTV {selectedCctv}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* 원본/ROI 버튼 */}
            <div className="flex gap-2">
              <Button
                variant={cctvViewMode === "original" ? "default" : "outline"}
                onClick={() => setCctvViewMode("original")}
                className="flex-1"
              >
                원본
              </Button>
              <Button
                variant={cctvViewMode === "roi" ? "default" : "outline"}
                onClick={() => setCctvViewMode("roi")}
                className="flex-1"
              >
                ROI 표시
              </Button>
            </div>

            {/* 촬영 정보 */}
            <div className="text-sm text-muted-foreground">
              촬영 시간: {format(now, "HH:mm:ss")} | 파일: test.jpg
            </div>

            {/* TIME SLOT */}
            <div className="text-sm text-muted-foreground">
              TIME SLOT: {format(now, "HH:mm:ss")}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
