import { useState } from "react";
import {
  Download,
  Trash2,
  Save,
  Info,
  CircleDot,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import cctvImage from "@/assets/cctv.jpg";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

const slotList = [
  "P230",
  "P231",
  "P232",
  "P233",
  "P234",
  "P235",
  "P236",
  "P237",
  "P238",
  "P239",
  "P240",
  "P241",
  "P242",
  "P243",
  "P244",
];

export function SpotEditorPage() {
  const [selectedFloor, setSelectedFloor] = useState("b1");
  const [selectedCctv, setSelectedCctv] = useState("1");
  const [isLive, setIsLive] = useState(true);
  const [selectedDirection, setSelectedDirection] = useState<1 | 2>(1);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [radius, setRadius] = useState([25]);
  const [isInfoPopoverOpen, setIsInfoPopoverOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [currentImage, setCurrentImage] = useState(1);
  const totalImages = 15;

  const currentCctvLabel =
    cctvOptions.find((c) => c.value === selectedCctv)?.label || "CCTV";

  const handleJsonDownload = () => {
    console.log("JSON 다운로드");
  };

  const handleDeleteAll = () => {
    console.log("전체 삭제");
  };

  const handleSaveToServer = () => {
    console.log("서버에 저장");
  };

  const handleDeleteSlot = (slotId: string) => {
    console.log("슬롯 삭제:", slotId);
  };

  const handleAddSpot = () => {
    console.log("현재 위치에 SPOT 추가");
  };

  const handleResetFromRoi = () => {
    console.log("ROI에서 초기화");
  };

  return (
    <div className="flex h-full flex-col gap-5">
      <h2 className="text-[28px] text-foreground font-bold">SPOT 에디터</h2>

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

        <Button variant="outline" onClick={handleJsonDownload}>
          <Download className="size-4" />
          JSON 다운로드
        </Button>

        <Button variant="outline" onClick={handleDeleteAll}>
          <Trash2 className="size-4" />
          전체 삭제
        </Button>

        <Button onClick={handleSaveToServer}>
          <Save className="size-4" />
          서버에 저장
        </Button>
      </div>

      {/* 하단 컨텐츠 */}
      <div className="flex flex-1 gap-3 overflow-hidden">
        {/* 좌측 조회 폼 */}
        <div className="flex w-64 shrink-0 flex-col gap-5 overflow-hidden rounded-xl border bg-background px-4 py-5">
          {/* 이미지 타입 버튼 */}
          <div className="flex gap-2">
            <Button
              variant={!isLive ? "default" : "outline"}
              onClick={() => setIsLive(false)}
              className="flex-1"
            >
              Inpainted
            </Button>
            <Button
              variant={isLive ? "default" : "outline"}
              onClick={() => setIsLive(true)}
              className="flex-1"
            >
              Live
            </Button>
          </div>

          {isLive && (
            <div className="flex flex-col">
              <span className="text-sm text-foreground mb-2">날짜</span>
              <DatePicker
                date={date}
                onDateChange={setDate}
                className="w-full justify-center"
              />
              <p className="text-base text-foreground font-bold text-center tabular-nums mt-5">
                00:00:00
              </p>
              <p className="text-xs text-muted-foreground text-center tabular-nums my-3">
                이미지: {currentImage}/{totalImages}
              </p>
              <Slider
                value={[currentImage]}
                onValueChange={(value) => setCurrentImage(value[0])}
                min={1}
                max={totalImages}
                step={1}
              />
              <div className="flex justify-between items-center gap-2 mt-5">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-md"
                  onClick={() =>
                    setCurrentImage((prev) => Math.max(1, prev - 1))
                  }
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <div className="flex gap-2">
                  <Button
                    size="xs"
                    className="bg-accent text-muted-foreground rounded-md"
                    onClick={() =>
                      setCurrentImage((prev) => Math.max(1, prev - 10))
                    }
                  >
                    -10
                  </Button>
                  <Button
                    size="xs"
                    className="bg-accent text-muted-foreground rounded-md"
                    onClick={() =>
                      setCurrentImage((prev) =>
                        Math.min(totalImages, prev + 10),
                      )
                    }
                  >
                    +10
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-md"
                  onClick={() =>
                    setCurrentImage((prev) => Math.min(totalImages, prev + 1))
                  }
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="bg-secondary/6 p-3 rounded-lg text-foreground">
            <h4 className="text-sm font-bold">SPOT 기반 점유 감지</h4>
            <p className="text-xs mt-2">
              각 슬롯에 N개의 원형 영역(SPOT)을 지정하고, Reference 이미지와
              비교하여 점유 여부 판단
            </p>
          </div>

          {/* 슬롯 목록 */}
          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <h3 className="text-sm text-foreground leading-tight pb-2 border-b">
              슬롯 목록 ({slotList.length})
            </h3>
            <div className="flex flex-col gap-2 overflow-y-auto">
              {slotList.map((slot) => (
                <div
                  key={slot}
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setSelectedSlot(slot)}
                >
                  <span
                    className={`text-sm font-bold tabular-nums ${selectedSlot === slot ? "text-primary" : "text-secondary-foreground"}`}
                  >
                    {slot}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSlot(slot);
                    }}
                    className="text-secondary-foreground hover:bg-transparent"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 우측 CCTV 이미지 영역 */}
        <div className="flex flex-1 flex-col gap-5 rounded-xl border bg-background">
          <TooltipProvider delayDuration={0}>
            <div className="flex flex-col gap-3 px-4 pt-5">
              <h3 className="flex items-center gap-2 text-base font-bold text-foreground leading-tight">
                {currentCctvLabel}
                <Separator orientation="vertical" className="h-3" />
                방향1 (상단)
                <Separator orientation="vertical" className="h-3" />
                P230
              </h3>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Input
                          placeholder="슬롯 ID (예: P001)"
                          value={selectedSlot ?? ""}
                          onChange={(e) => setSelectedSlot(e.target.value)}
                          className="w-48"
                          startIcon={<Search className="size-4" />}
                        />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent position="top">
                      슬롯 ID 입력 후 이미지 클릭으로 SPOT 추가
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    SPOT 반경
                  </span>
                  <Slider
                    value={radius}
                    onValueChange={setRadius}
                    min={0}
                    max={50}
                    step={1}
                    className="w-48"
                    showTooltip
                  />
                </div>
              </div>
            </div>
          </TooltipProvider>

          {/* 이미지 컨테이너 */}
          <div className="relative flex-1 overflow-hidden">
            {/* CCTV 이미지 */}
            <img
              src={cctvImage}
              alt="CCTV"
              className="h-full w-full object-contain"
            />

            {/* 컨트롤 버튼 */}
            <TooltipProvider delayDuration={0}>
              <div className="absolute right-4 bottom-5 flex flex-col items-end gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon-lg"
                      onClick={handleAddSpot}
                      className="bg-background/80 backdrop-blur-[1px]"
                    >
                      <CircleDot className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent position="left">
                    현재 위치에 SPOT 추가
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon-lg"
                      onClick={handleResetFromRoi}
                      className="bg-background/80 backdrop-blur-[1px]"
                    >
                      <RotateCcw className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent position="left">
                    ROI에서 초기화
                  </TooltipContent>
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
                            <h4 className="font-semibold text-sm">사용법:</h4>
                            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                              <li>클릭: 현재 슬롯에 SPOT 추가</li>
                              <li>드래그: 선택된 SPOT 이동</li>
                              <li>휠: 선택된 SPOT 반경 조절</li>
                              <li>Delete: 선택된 SPOT 삭제</li>
                              <li>ESC: 선택 해제</li>
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
          </div>
        </div>
      </div>
    </div>
  );
}
