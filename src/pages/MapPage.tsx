import { useState, useRef, useCallback, useEffect } from "react";
import { format } from "date-fns";
import {
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Clock,
  File,
  Camera,
} from "lucide-react";
import MapSvg from "@/assets/map.svg?react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
    <div className="flex h-full flex-col gap-5">
      <h2 className="text-[28px] text-foreground font-bold">출차감지</h2>
      {/* 상단 카드 리스트 */}
      <div className="flex items-center gap-3">
        {[
          { label: "입주민 주차 중", value: "86" },
          { label: "방문객 주차 중", value: "62" },
          { label: "미확인 주차 중", value: "29" },
          { label: "빈 주차 칸", value: "12" },
        ].map((item) => (
          <div
            key={item.label}
            className="h-28.5 flex flex-col justify-between flex-1 rounded-xl bg-primary-foreground p-4"
          >
            <p className="text-sm text-foreground">{item.label}</p>
            <p className="text-[28px] text-foreground font-bold">
              {item.value}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDateTime(now)} 기준
            </p>
          </div>
        ))}
        <div className="h-28.5 flex flex-col justify-between flex-1 rounded-xl bg-foreground p-4">
          <p className="text-sm text-background">주차 점유율</p>
          <p className="flex items-center gap-1 text-[28px] font-semibold text-secondary-foreground">
            <span className="text-secondary">234</span>
            <span>/</span>
            <span>491</span>
          </p>
          <p className="text-xs text-border">{formatDateTime(now)} 기준</p>
        </div>
      </div>

      {/* 검색 폼 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* 입주민 조회 */}
          <div className="flex items-center gap-2">
            <Label>입주민 조회</Label>
            <Select>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="동" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1101">1101동</SelectItem>
                <SelectItem value="1102">1102동</SelectItem>
                <SelectItem value="1103">1103동</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="층/호" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="11">1층 1호</SelectItem>
                <SelectItem value="21">2층 1호</SelectItem>
                <SelectItem value="31">3층 1호</SelectItem>
                <SelectItem value="41">4층 1호</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 일자 데이트피커 */}
          <div className="flex items-center gap-2">
            <Label>날짜</Label>
            <DatePicker date={date} onDateChange={setDate} />
          </div>

          {/* 층 셀렉트 */}
          <div className="flex items-center gap-2">
            <Label>층</Label>
            <Select defaultValue="b1">
              <SelectTrigger>
                <SelectValue placeholder="층 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="b3">B3</SelectItem>
                <SelectItem value="b2">B2</SelectItem>
                <SelectItem value="b1">B1</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 슬라이더 */}
          <div className="flex items-center gap-3 px-4">
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
                  className="absolute z-1 top-4.5 flex flex-col items-center"
                  style={{
                    left: `calc(${(time[0] / 1440) * 100}% + ${8 - (time[0] / 1440) * 16}px)`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <div className="size-2.5 rotate-45 bg-primary" />
                  <div className="-mt-[5px] rounded-sm bg-primary px-3 py-1.5 text-xs text-secondary font-bold">
                    {formatTime(time[0])}
                  </div>
                </div>
              )}
            </div>
            <span className="text-xs text-muted-foreground">24:00</span>
          </div>

          {/* 차량검색 인풋 */}
          <Input
            placeholder="차량번호 입력"
            className="w-48"
            startIcon={<Search className="size-4" />}
          />

          {/* 검색 버튼 */}
          <Button>검색</Button>
        </div>
      </div>

      {/* 메인 영역: 조회 폼 + 지도 */}
      <div className="flex flex-1 gap-3 overflow-hidden">
        {/* 좌측 조회 폼 */}
        <div className="flex w-64 shrink-0 flex-col gap-5 overflow-y-auto rounded-xl border bg-background px-4 py-5">
          {/* 조회 결과 */}
          <div className="space-y-1">
            <h3 className="text-base text-foreground font-bold">입주민 0006</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>010-1234-5678</span>
              <Separator orientation="vertical" className="h-2" />
              <span>1101-0201</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-foreground">보유 차량</p>
            {sampleParkingData.map((spot) => (
              <Button
                key={spot.parkingId}
                variant="outline"
                className="h-auto w-full flex-col items-start gap-0 px-4 py-3 bg-muted-foreground hover:bg-muted-foreground/90"
                onClick={() => moveToParkingSpot(spot.parkingId)}
              >
                <p className="text-sm text-secondary font-bold">
                  {spot.plateNumber}
                </p>
                <p className="text-sm text-background">{spot.location}</p>
                <p className="mt-2 text-xs text-background/80">
                  {formatDateTime(spot.parkedAt)}
                </p>
              </Button>
            ))}
          </div>
        </div>

        {/* 우측 지도 영역 */}
        <div
          ref={mapContainerRef}
          className="relative flex-1 overflow-hidden rounded-xl border bg-background"
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
                top: tooltipPosition.y - 6,
                transform: "translate(-50%, -100%)",
              }}
            >
              <div className="rounded-sm bg-primary px-3 py-1.5 text-xs text-secondary font-bold">
                {hoveredSpot.parkingId} (차량 있음)
              </div>
              <div className="-mt-[5px] size-2.5 rotate-45 bg-primary" />
            </div>
          )}

          {/* 우측 상단 컨트롤 */}
          <div className="absolute right-3 top-3 flex gap-2">
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
          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
            {[
              { color: "#A4FF04", label: "전기차" },
              { color: "#FCA5A5", label: "임산부" },
              { color: "#93C5FD", label: "장애인" },
              { color: "#E9D5FF", label: "경차" },
              { color: "#666666", label: "일반" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                <div
                  className="size-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CCTV 모달 */}
      <Dialog open={cctvModalOpen} onOpenChange={setCctvModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>CCTV {selectedCctv}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
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

            {/* 이미지 영역 */}
            <div className="flex aspect-video items-center justify-center rounded-lg border bg-muted">
              <span className="text-sm text-muted-foreground">이미지 영역</span>
            </div>

            {/* 촬영 정보 */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground leading-tight">
              <Camera className="size-4" />
              <span>촬영 시간: {format(now, "HH:mm:ss")}</span>
              <Separator orientation="vertical" className="h-3" />
              <File className="size-4" />
              <span>파일: test.jpg</span>
            </div>

            {/* TIME SLOT */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground leading-tight">
              <Clock className="size-4" />
              <span>TIME SLOT: {format(now, "HH:mm:ss")}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
