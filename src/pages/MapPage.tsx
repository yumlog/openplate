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

const ZOOM_MIN = 50;
const ZOOM_MAX = 500;
const ZOOM_STEP = 10;

export function MapPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<number[]>([720]);
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

  // 주차 위치로 지도 이동 (500% 확대 후 지도 컨테이너 중앙 정렬)
  const moveToParkingSpot = useCallback((parkingId: string) => {
    const svgContainer = svgContainerRef.current;
    const container = mapContainerRef.current;
    const parkingEl = svgContainer?.querySelector(
      `[data-parking-id="${parkingId}"]`,
    );

    if (!parkingEl || !container || !svgContainer) return;

    // 일시적으로 transform 초기화해서 기준 위치 계산
    const originalTransform = svgContainer.style.transform;
    svgContainer.style.transform = "translate(0px, 0px) scale(1)";
    svgContainer.getBoundingClientRect(); // 강제 리플로우

    // 컨테이너 중앙과 주차칸 중앙 사이의 거리 계산
    const containerRect = container.getBoundingClientRect();
    const parkingRect = parkingEl.getBoundingClientRect();
    const distX =
      containerRect.left +
      containerRect.width / 2 -
      (parkingRect.left + parkingRect.width / 2);
    const distY =
      containerRect.top +
      containerRect.height / 2 -
      (parkingRect.top + parkingRect.height / 2);

    svgContainer.style.transform = originalTransform;

    // 500% 확대 시 이동 거리 적용
    const scale = ZOOM_MAX / 100;
    setZoom(ZOOM_MAX);
    setPosition({ x: distX * scale, y: distY * scale });
  }, []);

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
    setZoom((prev) => Math.min(prev + ZOOM_STEP, ZOOM_MAX));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, ZOOM_MIN));
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

  const handleMapMouseEnd = useCallback(() => {
    setIsMapDragging(false);
  }, []);

  // 휠 이벤트를 useEffect로 바인딩하여 passive: false 옵션 사용
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        setZoom((prev) => Math.min(prev + ZOOM_STEP, ZOOM_MAX));
      } else {
        setZoom((prev) => Math.max(prev - ZOOM_STEP, ZOOM_MIN));
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <div className="flex h-full flex-col gap-5">
      <h2 className="text-[28px] text-foreground font-bold">지도</h2>
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
            <Slider
              value={time}
              onValueChange={setTime}
              min={0}
              max={1440}
              step={30}
              className="w-48"
              showTooltip
              formatTooltip={formatTime}
            />
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
        <div className="flex w-64 shrink-0 flex-col gap-5 overflow-hidden rounded-xl border bg-background px-4 py-5">
          {/* 조회 결과 */}
          <div className="space-y-1">
            <h3 className="text-base text-foreground font-bold leading-tight">
              입주민 0006
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground leading-tight">
              <span>010-1234-5678</span>
              <Separator orientation="vertical" className="h-2" />
              <span>1101-0201</span>
            </div>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <p className="text-sm text-foreground leading-tight">보유 차량</p>
            <div className="flex flex-col gap-2 overflow-y-auto">
              {sampleParkingData.map((spot) => (
                <Button
                  key={spot.parkingId}
                  variant="outline"
                  className="h-auto w-full shrink-0 flex-col items-start gap-0 px-4 py-3 bg-muted-foreground hover:bg-muted-foreground/90"
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
        </div>

        {/* 우측 지도 영역 */}
        <div
          ref={mapContainerRef}
          className="relative flex-1 overflow-hidden rounded-xl border bg-background"
          onMouseDown={handleMapMouseDown}
          onMouseMove={handleMapMouseMove}
          onMouseUp={handleMapMouseEnd}
          onMouseLeave={handleMapMouseEnd}
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
              <div className="-mt-1.25 size-2.5 rotate-45 bg-primary" />
            </div>
          )}

          {/* 우측 상단 컨트롤 */}
          <div className="absolute right-4 bottom-5 flex flex-col items-end gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomIn}
              className="bg-background/80 backdrop-blur-[1px]"
            >
              <ZoomIn className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomOut}
              className="bg-background/80 backdrop-blur-[1px]"
            >
              <ZoomOut className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomReset}
              className="bg-background/80 backdrop-blur-[1px]"
            >
              <RotateCcw className="size-4" />
            </Button>
            <div className="flex h-9 items-center justify-center rounded-md border bg-background/80 backdrop-blur-[1px] px-2 text-center text-sm text-foreground tabular-nums">
              {zoom}%
            </div>
          </div>

          {/* 좌측 하단 범례 */}
          <div className="absolute bottom-5 left-4 flex flex-col gap-1 rounded-lg border bg-background/80 backdrop-blur-[1px] px-3 py-2">
            {[
              { color: "#55D400", label: "전기차" },
              { color: "#FF9F9F", label: "임산부" },
              { color: "#83BDFF", label: "장애인" },
              { color: "#00439F", label: "경차" },
              { color: "#666666", label: "일반" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                <div
                  className="size-2 rounded-full"
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
            <div className="flex justify-between items-center divide-x">
              {[
                {
                  icon: Camera,
                  content: `촬영 시간: ${format(now, "HH:mm:ss")}`,
                },
                {
                  icon: File,
                  content: (
                    <span className="flex items-center">
                      파일:&nbsp;<span className="truncate max-w-24">test</span>
                      .jpg
                    </span>
                  ),
                },
                {
                  icon: Clock,
                  content: `TIME SLOT: ${format(now, "HH:mm:ss")}`,
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex-1 flex justify-center items-center gap-2 text-sm text-muted-foreground leading-tight"
                >
                  <item.icon className="size-4" />
                  <span>{item.content}</span>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
