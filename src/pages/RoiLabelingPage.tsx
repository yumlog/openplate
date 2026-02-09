import { useState, useRef, MouseEvent } from "react";
import { format } from "date-fns";
import {
  Save,
  RefreshCw,
  Download,
  Pencil,
  PencilOff,
  Undo2,
  Trash2,
  Info,
  Crosshair,
} from "lucide-react";
import cctvImage from "@/assets/cctv.jpg";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { floorOptions, cctvOptions } from "@/constants";

const parkingSlots = [
  "P230",
  "P231",
  "P232",
  "P233",
  "P234",
  "P235",
  "P236",
  "P237",
];

const now = new Date();

interface Point {
  x: number;
  y: number;
}

export function RoiLabelingPage() {
  const [selectedFloor, setSelectedFloor] = useState("b1");
  const [selectedCctv, setSelectedCctv] = useState("");
  const [selectedDirection, setSelectedDirection] = useState<1 | 2>(1);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isInfoPopoverOpen, setIsInfoPopoverOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [saveAlertOpen, setSaveAlertOpen] = useState(false);

  // ROI 그리기 관련 상태
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // 주차칸별 완료 상태 (방향 -> 주차칸 ID -> ROI 좌표)
  const [completedSlots, setCompletedSlots] = useState<
    Record<1 | 2, Record<string, Point[]>>
  >({ 1: {}, 2: {} });

  // 현재 방향의 완료된 슬롯
  const currentDirectionSlots = completedSlots[selectedDirection];

  const currentFloorLabel =
    floorOptions.find((f) => f.value === selectedFloor)?.label || "";
  const currentCctvLabel =
    cctvOptions.find((c) => c.value === selectedCctv)?.label || "";

  // 이미지 클릭 핸들러 - 꼭지점 추가
  const handleImageClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDrawing) return;

    // 버튼 클릭 시 점이 생성되지 않도록 체크
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;

    const container = imageContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    const containerHeight = rect.height;
    const halfHeight = containerHeight / 2;

    // 방향에 따라 클릭 영역 제한 (방향1: 상단, 방향2: 하단)
    const isOutOfBounds =
      (selectedDirection === 1 && y > halfHeight) ||
      (selectedDirection === 2 && y < halfHeight);
    if (isOutOfBounds) return;

    const newPoints = [...drawingPoints, { x, y }];
    setDrawingPoints(newPoints);

    // 4개 점이 모두 찍히면 ROI 완성
    if (newPoints.length === 4) {
      setDrawingPoints([]);
      setIsDrawing(false);

      // 선택된 주차칸이 있으면 완료 상태로 저장
      if (selectedSlot) {
        setCompletedSlots((prev) => ({
          ...prev,
          [selectedDirection]: {
            ...prev[selectedDirection],
            [selectedSlot]: newPoints,
          },
        }));
      }
    }
  };

  // 새 ROI 그리기 시작
  const startDrawing = () => {
    setIsDrawing(true);
    setDrawingPoints([]);
  };

  // 그리기 취소
  const cancelDrawing = () => {
    setIsDrawing(false);
    setDrawingPoints([]);
  };

  // 마지막 점 취소
  const undoLastPoint = () => setDrawingPoints(drawingPoints.slice(0, -1));

  // ROI 삭제
  const deleteRoi = () => {
    // 그리는 중이면 그리기 취소
    if (isDrawing || drawingPoints.length > 0) {
      setDrawingPoints([]);
      setIsDrawing(false);
      return;
    }
    // 선택된 주차칸의 ROI 삭제
    if (selectedSlot && currentDirectionSlots[selectedSlot]) {
      setCompletedSlots((prev) => {
        const newDirectionSlots = { ...prev[selectedDirection] };
        delete newDirectionSlots[selectedSlot];
        return {
          ...prev,
          [selectedDirection]: newDirectionSlots,
        };
      });
    }
  };

  // 주차칸 완료 여부 확인
  const isSlotCompleted = (slot: string) =>
    completedSlots[1][slot] || completedSlots[2][slot];

  // 현재 표시할 포인트 (그리는 중이면 drawingPoints, 선택된 주차칸이 있으면 해당 ROI)
  const displayPoints =
    drawingPoints.length > 0
      ? drawingPoints
      : (selectedSlot && currentDirectionSlots[selectedSlot]) || [];

  // 진행률 계산 (양 방향 합산, 중복 제거)
  const completedCount = parkingSlots.filter(isSlotCompleted).length;
  const totalCount = parkingSlots.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // SVG 폴리곤 포인트 문자열 생성
  const getPolygonPoints = (points: Point[]) =>
    points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="flex h-full flex-col gap-5">
      <h2 className="text-[28px] text-foreground font-bold">ROI 라벨링</h2>

      {/* 상단 검색 폼 */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <Label>층</Label>
          <Select value={selectedFloor} onValueChange={setSelectedFloor}>
            <SelectTrigger className="w-26">
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

        <Button variant="outline">
          <Download className="size-4" />
          전체 불러오기
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            if (!selectedCctv) {
              setAlertOpen(true);
            }
          }}
        >
          <RefreshCw className="size-4" />
          현재 CCTV ROI 새로고침
        </Button>

        <Button onClick={() => setSaveAlertOpen(true)}>
          <Save className="size-4" />
          저장
        </Button>
      </div>

      {/* 하단 컨텐츠 */}
      <div className="flex flex-1 gap-3 overflow-hidden">
        {/* 좌측 조회 폼 */}
        <div className="flex w-64 shrink-0 flex-col gap-5 overflow-y-auto rounded-xl border bg-background px-4 py-5">
          {selectedCctv ? (
            <>
              {/* 방향 버튼 */}
              <div className="flex gap-2">
                <Button
                  variant={selectedDirection === 1 ? "default" : "outline"}
                  onClick={() => setSelectedDirection(1)}
                  className="flex-1"
                >
                  방향1 선택
                </Button>
                <Button
                  variant={selectedDirection === 2 ? "default" : "outline"}
                  onClick={() => setSelectedDirection(2)}
                  className="flex-1"
                >
                  방향2 선택
                </Button>
              </div>

              {/* 주차칸 목록 */}
              <div className="space-y-2">
                <h3 className="text-sm text-foreground leading-tight pb-2 border-b">
                  주차칸 목록
                </h3>
                <div className="flex flex-col gap-1">
                  {parkingSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant="ghost"
                      onClick={() => setSelectedSlot(slot)}
                      className={`w-full h-auto justify-between p-0 hover:bg-transparent ${selectedSlot === slot ? "text-primary" : "text-secondary-foreground"}`}
                    >
                      <span className="font-bold tabular-nums">{slot}</span>
                      <Badge
                        variant={
                          isSlotCompleted(slot) ? "secondary" : "outline"
                        }
                      >
                        {isSlotCompleted(slot) ? "완료" : "미완료"}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="flex-1 flex items-center justify-center text-center text-sm text-muted-foreground">
              CCTV를 선택하면
              <br />
              주차칸 목록이 표시됩니다.
            </p>
          )}
        </div>

        {/* 우측 CCTV 이미지 영역 */}
        <div className="flex flex-1 flex-col gap-5 rounded-xl border bg-background">
          {selectedCctv ? (
            <>
              <div className="flex items-center justify-between px-4 pt-5">
                <div className="flex flex-col gap-1">
                  <h3 className="flex items-center gap-2 text-base font-bold text-foreground leading-tight">
                    {currentFloorLabel}
                    <Separator orientation="vertical" className="h-3" />
                    {currentCctvLabel}
                    <Separator orientation="vertical" className="h-3" />
                    방향{selectedDirection} (
                    {selectedDirection === 1 ? "상단" : "하단"})
                    {selectedSlot && (
                      <>
                        <Separator orientation="vertical" className="h-3" />
                        <span className="text-primary">{selectedSlot}</span>
                      </>
                    )}
                  </h3>
                  <span className="text-sm text-muted-foreground tabular-nums leading-tight">
                    {format(now, "HH:mm:ss")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={progressPercent} className="w-32" />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {completedCount}/{totalCount} 완료 ({progressPercent}%)
                  </span>
                </div>
              </div>

              {/* 이미지 컨테이너 */}
              <div
                ref={imageContainerRef}
                className={`relative flex-1 overflow-hidden ${isDrawing ? "cursor-crosshair" : ""}`}
                onClick={handleImageClick}
              >
                {/* CCTV 이미지 */}
                <img
                  src={cctvImage}
                  alt="CCTV"
                  className="h-full w-full object-contain pointer-events-none"
                />

                {/* 방향에 따른 블러 오버레이 */}
                <div
                  className="absolute inset-x-0 top-0 bottom-1/2 pointer-events-none transition-all duration-300"
                  style={{
                    backdropFilter:
                      selectedDirection === 2 ? "blur(4px)" : "blur(0px)",
                  }}
                />
                <div
                  className="absolute inset-x-0 top-1/2 bottom-0 pointer-events-none transition-all duration-300"
                  style={{
                    backdropFilter:
                      selectedDirection === 1 ? "blur(4px)" : "blur(0px)",
                  }}
                />

                {/* ROI 오버레이 SVG */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <style>
                      {`
                        @keyframes popIn {
                          0% { transform: scale(0); opacity: 0; }
                          50% { transform: scale(1.3); }
                          100% { transform: scale(1); opacity: 1; }
                        }
                        @keyframes pulse {
                          0%, 100% { transform: scale(1); }
                          50% { transform: scale(1.2); }
                        }
                        @keyframes marchingAnts {
                          to { stroke-dashoffset: -16; }
                        }
                        .roi-point {
                          transform-origin: center;
                          transform-box: fill-box;
                          animation: popIn 0.25s ease-out forwards;
                        }
                        .roi-point-pulse {
                          transform-origin: center;
                          transform-box: fill-box;
                          animation: pulse 1s ease-in-out infinite;
                        }
                        .roi-marching {
                          stroke-dasharray: 8 8;
                          animation: marchingAnts 1s linear infinite;
                        }
                        .roi-polygon-fill {
                          transition: fill-opacity 0.2s ease-out;
                        }
                        .roi-polygon-stroke {
                          transition: stroke-width 0.2s ease-out;
                        }
                        .roi-circle {
                          transition: r 0.2s ease-out, stroke-width 0.2s ease-out;
                        }
                      `}
                    </style>
                  </defs>

                  {/* 현재 방향의 완료된 ROI 표시 */}
                  {Object.entries(currentDirectionSlots).map(
                    ([slotId, points]) => {
                      const isSelected = selectedSlot === slotId;
                      return (
                        <g
                          key={slotId}
                          className="cursor-pointer"
                          style={{ pointerEvents: isDrawing ? "none" : "auto" }}
                          onClick={() => setSelectedSlot(slotId)}
                        >
                          <polygon
                            className="roi-polygon-fill"
                            points={getPolygonPoints(points)}
                            fill="#a3ff05"
                            fillOpacity={isSelected ? "0.5" : "0.25"}
                            stroke="none"
                          />
                          <polygon
                            className={`roi-polygon-stroke ${isSelected ? "roi-marching" : ""}`}
                            points={getPolygonPoints(points)}
                            fill="none"
                            stroke="#a3ff05"
                            strokeWidth={isSelected ? "2" : "1"}
                            strokeLinejoin="round"
                          />
                          {points.map((point, index) => (
                            <circle
                              className="roi-circle"
                              key={`${slotId}-${index}`}
                              cx={point.x}
                              cy={point.y}
                              r={isSelected ? 6 : 4}
                              fill="#262626"
                              stroke="#a3ff05"
                              strokeWidth={isSelected ? 2 : 1}
                            />
                          ))}
                        </g>
                      );
                    },
                  )}

                  {/* 현재 그리는 중인 폴리라인 (4점 미만) */}
                  {drawingPoints.length >= 2 && (
                    <polyline
                      key={drawingPoints.length}
                      className="roi-marching"
                      points={getPolygonPoints(drawingPoints)}
                      fill="none"
                      stroke="#a3ff05"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  )}
                  {/* 현재 그리는 중인 꼭지점 원 */}
                  {drawingPoints.map((point, index) => (
                    <circle
                      key={`drawing-${index}-${point.x}-${point.y}`}
                      className={`roi-point ${isDrawing && index === drawingPoints.length - 1 ? "roi-point-pulse" : ""}`}
                      cx={point.x}
                      cy={point.y}
                      r="6"
                      fill="#262626"
                      stroke="#a3ff05"
                      strokeWidth="2"
                    />
                  ))}
                </svg>

                {/* 우측 하단 컨트롤 버튼 */}
                <TooltipProvider delayDuration={0}>
                  <div className="absolute right-4 bottom-5 flex flex-col items-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            variant={isDrawing ? "default" : "outline"}
                            size="icon-lg"
                            className={
                              isDrawing
                                ? ""
                                : "bg-background/80 backdrop-blur-[1px]"
                            }
                            onClick={startDrawing}
                            disabled={isDrawing || !selectedSlot}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent position="left">
                        새 ROI 그리기
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            variant="outline"
                            size="icon-lg"
                            className="bg-background/80 backdrop-blur-[1px]"
                            onClick={cancelDrawing}
                            disabled={!isDrawing}
                          >
                            <PencilOff className="size-4" />
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent position="left">
                        그리기 취소
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            variant="outline"
                            size="icon-lg"
                            className="bg-background/80 backdrop-blur-[1px]"
                            onClick={undoLastPoint}
                            disabled={!isDrawing || drawingPoints.length === 0}
                          >
                            <Undo2 className="size-4" />
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent position="left">점 취소</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            variant="outline"
                            size="icon-lg"
                            className="bg-background/80 backdrop-blur-[1px]"
                            onClick={deleteRoi}
                            disabled={
                              drawingPoints.length === 0 &&
                              !(
                                selectedSlot &&
                                currentDirectionSlots[selectedSlot]
                              )
                            }
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent position="left">ROI 삭제</TooltipContent>
                    </Tooltip>
                    <Tooltip open={isInfoPopoverOpen ? false : undefined}>
                      <TooltipTrigger asChild>
                        <span>
                          <Popover
                            open={isInfoPopoverOpen}
                            onOpenChange={setIsInfoPopoverOpen}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon-lg"
                                className="bg-background/80 backdrop-blur-[1px]"
                              >
                                <Info className="size-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-64">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-sm">
                                  사용법:
                                </h4>
                                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                                  <li>주차칸을 선택합니다</li>
                                  <li>이미지에서 4개의 꼭짓점을 클릭합니다</li>
                                  <li>
                                    좌상단 → 우상단 → 우하단 → 좌하단 순서
                                  </li>
                                  <li>4점이 완성되면 자동 저장됩니다</li>
                                </ol>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent position="left">사용법</TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>

                {/* 좌측 하단 범례 */}
                <div className="absolute bottom-5 left-4 flex flex-col gap-1 rounded-lg border bg-background/80 backdrop-blur-[1px] px-3 py-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Crosshair className="size-3" />
                    <span>현재 ROI 좌표</span>
                    {isDrawing && (
                      <span className="text-muted-foreground">
                        ({displayPoints.length}/4)
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {displayPoints.length > 0 ? (
                      displayPoints.map((point, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 text-xs text-foreground tabular-nums"
                        >
                          <span className="font-medium">P{index + 1}:</span>
                          <span className="text-muted-foreground">
                            {point.x}, {point.y}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {isDrawing ? "이미지를 클릭하세요" : "ROI가 없습니다"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-muted-foreground">
                CCTV를 선택하면 이미지가 표시됩니다.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CCTV 미선택 알림 */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>현재 CCTV ROI 새로고침</AlertDialogTitle>
            <AlertDialogDescription>
              CCTV를 먼저 선택 후 새로고침 해주세요
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
