import { useState } from "react";
import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Image,
  Save,
  Trash2,
  Info,
} from "lucide-react";
import cctvImage from "@/assets/cctv.jpg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

// 더미 데이터: 수집된 빈 슬롯 목록
const collectedSlots = [
  { id: "P149", time: "00:00:00" },
  { id: "P150", time: "00:05:00" },
  { id: "P151", time: "00:10:00" },
  { id: "P152", time: "00:15:00" },
  { id: "P153", time: "00:20:00" },
  { id: "P154", time: "00:25:00" },
  { id: "P155", time: "00:30:00" },
  { id: "P156", time: "00:35:00" },
  { id: "P157", time: "00:40:00" },
  { id: "P158", time: "00:45:00" },
  { id: "P159", time: "00:50:00" },
  { id: "P160", time: "00:55:00" },
  { id: "P161", time: "01:00:00" },
  { id: "P162", time: "01:05:00" },
  { id: "P163", time: "01:10:00" },
];

export function ReferenceBuilderPage() {
  const [selectedFloor, setSelectedFloor] = useState("b1");
  const [selectedCctv, setSelectedCctv] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const totalPages = 15;

  // 더미 데이터
  const collectedCount = 10;
  const totalRoi = 15;
  const progressPercentage = (collectedCount / totalRoi) * 100;

  const now = new Date();

  const currentCctvLabel =
    cctvOptions.find((c) => c.value === selectedCctv)?.label || "CCTV";

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleDeleteSlot = (slotId: string) => {
    console.log("삭제:", slotId);
  };

  const handleGenerateReference = () => {
    console.log("Reference 이미지 생성");
    setIsConfirmOpen(false);
  };

  return (
    <div className="flex h-full flex-col gap-5">
      <h2 className="text-[28px] text-foreground font-bold">Reference 빌더</h2>

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

        <div className="flex items-center gap-2">
          <Label>날짜</Label>
          <DatePicker date={date} onDateChange={setDate} />
        </div>

        <Button
          variant="outline"
          onClick={() => setIsPreviewOpen(true)}
          disabled={!selectedCctv}
        >
          <Eye className="size-4" />
          프리뷰 보기
        </Button>

        <Button
          variant="outline"
          onClick={() => setIsConfirmOpen(true)}
          disabled={!selectedCctv}
        >
          <Image className="size-4" />
          Reference 이미지 생성
        </Button>

        <Button>
          <Save className="size-4" />
          수집 데이터 저장
        </Button>
      </div>

      {/* 하단 컨텐츠 */}
      <div className="flex flex-1 gap-3 overflow-hidden">
        {/* 좌측 조회 폼 */}
        <div className="flex w-64 shrink-0 flex-col gap-5 overflow-hidden rounded-xl border bg-background px-4 py-5">
          {selectedCctv ? (
            <>
              {/* 수집된 빈 슬롯 */}
              <div className="shrink-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base text-foreground font-bold leading-tight">
                    수집된 빈 슬롯
                  </h3>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Info className="size-4 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-64">
                      <p className="text-sm text-muted-foreground">
                        빈 주차 공간을 클릭하여 Reference 이미지를 구성하세요
                      </p>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-5 mb-3">
                  <div className="h-15 flex flex-col justify-center items-center bg-primary rounded-lg px-4 py-2">
                    <span className="text-sm text-secondary font-medium">
                      {collectedCount}
                    </span>
                    <span className="text-xs text-background">수집됨</span>
                  </div>
                  <div className="h-15 flex flex-col justify-center items-center border rounded-lg px-4 py-2">
                    <span className="text-sm font-medium">{totalRoi}</span>
                    <span className="text-xs text-muted-foreground">
                      전체 ROI
                    </span>
                  </div>
                </div>

                <Progress value={progressPercentage} />
              </div>

              {/* 주차칸 목록 */}
              <div className="flex min-h-0 flex-1 flex-col gap-2">
                <h3 className="text-sm text-foreground leading-tight pb-2 border-b">
                  주차칸 목록
                </h3>
                <div className="flex flex-col gap-2 overflow-y-auto">
                  {collectedSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setSelectedSlot(slot.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-sm font-bold tabular-nums ${selectedSlot === slot.id ? "text-primary" : "text-secondary-foreground"}`}
                        >
                          {slot.id}
                        </span>
                        <span className="text-sm text-muted-foreground tabular-nums">
                          {slot.time}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSlot(slot.id);
                        }}
                        className="text-secondary-foreground hover:bg-transparent"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="flex-1 flex items-center justify-center text-center text-sm text-muted-foreground">
              CCTV를 선택하면
              <br />
              슬롯 목록이 표시됩니다.
            </p>
          )}
        </div>

        {/* 우측 CCTV 이미지 영역 */}
        <div className="flex flex-1 flex-col gap-5 rounded-xl border bg-background">
          {selectedCctv ? (
            <>
              <div className="flex justify-between px-4 pt-5">
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-bold text-foreground leading-tight">
                    {currentCctvLabel}
                  </h3>
                  <span className="text-sm text-muted-foreground tabular-nums leading-tight">
                    {format(now, "HH:mm:ss")}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon-lg"
                    className="rounded-md"
                    onClick={handlePrevPage}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="w-14 text-sm text-muted-foreground text-center tabular-nums">
                    {currentPage}/{totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon-lg"
                    className="rounded-md"
                    onClick={handleNextPage}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
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

                {/* 좌측 하단: 조작 안내 */}
                <div className="absolute bottom-5 left-4 flex items-center gap-3 rounded-lg border bg-background/80 backdrop-blur-[1px] px-3 py-2 text-sm text-foreground">
                  <span className="flex items-center gap-1.5">
                    <Badge size="sm">←</Badge>
                    <Badge size="sm">→</Badge>이미지이동
                  </span>
                  <span className="text-muted-foreground">|</span>
                  <span className="flex items-center gap-1.5">
                    <Badge size="sm">클릭</Badge> 빈 슬롯 수집
                  </span>
                  <span className="text-muted-foreground">|</span>
                  <span className="flex items-center gap-1.5">
                    <Badge size="sm">Shift+클릭</Badge> 수집 취소
                  </span>
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

      {/* 프리뷰 다이얼로그 */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Reference 이미지 프리뷰</DialogTitle>
          </DialogHeader>
          <div className="overflow-hidden rounded-lg border">
            <img
              src={cctvImage}
              alt="CCTV Preview"
              className="h-full w-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Reference 이미지 생성 확인 다이얼로그 */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Reference 이미지 생성</AlertDialogTitle>
            <AlertDialogDescription>
              Reference 이미지를 생성하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleGenerateReference}>
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
