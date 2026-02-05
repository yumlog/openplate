import { useState } from "react";
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

const floorOptions = [
  { value: "b3", label: "B3" },
  { value: "b2", label: "B2" },
  { value: "b1", label: "B1" },
];

const cctvOptions = [
  { value: "1", label: "CCTV 1" },
  { value: "2", label: "CCTV 2" },
  { value: "3", label: "CCTV 3" },
  { value: "4", label: "CCTV 4" },
];

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

const dummyPoints = [
  { label: "P1", x: 364, y: 353 },
  { label: "P2", x: 296, y: 272 },
  { label: "P3", x: 677, y: 220 },
  { label: "P4", x: 776, y: 302 },
];

const now = new Date();

export function RoiLabelingPage() {
  const [selectedFloor, setSelectedFloor] = useState("b1");
  const [selectedCctv, setSelectedCctv] = useState("");
  const [selectedDirection, setSelectedDirection] = useState<1 | 2>(1);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isInfoPopoverOpen, setIsInfoPopoverOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [saveAlertOpen, setSaveAlertOpen] = useState(false);

  const currentCctvLabel =
    cctvOptions.find((c) => c.value === selectedCctv)?.label || "";

  return (
    <div className="flex h-full flex-col gap-5">
      <h2 className="text-[28px] text-foreground font-bold">ROI 라벨링</h2>

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
                      {slot === "P230" ? (
                        <Badge variant="secondary">완료</Badge>
                      ) : (
                        <Badge variant="outline">미완료</Badge>
                      )}
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
                    {currentCctvLabel}
                    <Separator orientation="vertical" className="h-3" />
                    방향{selectedDirection} (
                    {selectedDirection === 1 ? "상단" : "하단"})
                  </h3>
                  <span className="text-sm text-muted-foreground tabular-nums leading-tight">
                    {format(now, "HH:mm:ss")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={25} className="w-32" />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    0/615 완료(0%)
                  </span>
                </div>
              </div>

              {/* 이미지 컨테이너 */}
              <div className="relative flex-1 overflow-hidden">
                {/* CCTV 이미지 */}
                <img
                  src={cctvImage}
                  alt="CCTV"
                  className="h-full w-full object-contain"
                />

                {/* 우측 상단 컨트롤 버튼 */}
                <TooltipProvider delayDuration={0}>
                  <div className="absolute right-4 bottom-5 flex flex-col items-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon-lg"
                          className="bg-background/80 backdrop-blur-[1px]"
                        >
                          <Pencil className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent position="left">
                        새 ROI 그리기
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon-lg"
                          className="bg-background/80 backdrop-blur-[1px]"
                        >
                          <PencilOff className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent position="left">
                        그리기 취소
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon-lg"
                          className="bg-background/80 backdrop-blur-[1px]"
                        >
                          <Undo2 className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent position="left">점 취소</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon-lg"
                          className="bg-background/80 backdrop-blur-[1px]"
                        >
                          <Trash2 className="size-4" />
                        </Button>
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
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {dummyPoints.map((point) => (
                      <div
                        key={point.label}
                        className="flex items-center gap-1 text-xs text-foreground tabular-nums"
                      >
                        <span className="font-medium">{point.label}:</span>
                        <span className="text-muted-foreground">
                          {point.x}, {point.y}
                        </span>
                      </div>
                    ))}
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
