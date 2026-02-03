import { useState } from "react";
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

export function RoiLabelingPage() {
  const [selectedFloor, setSelectedFloor] = useState("b1");
  const [selectedCctv, setSelectedCctv] = useState("1");
  const [selectedDirection, setSelectedDirection] = useState<1 | 2>(1);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

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

        <Button>
          <Save className="size-4" />
          저장
        </Button>

        <Button variant="outline">
          <Download className="size-4" />
          전체 불러오기
        </Button>

        <Button variant="outline">
          <RefreshCw className="size-4" />
          현재 CCTV ROI 새로고침
        </Button>
      </div>

      {/* 하단 컨텐츠 */}
      <div className="flex flex-1 gap-3 overflow-hidden">
        {/* 좌측 조회 폼 */}
        <div className="flex w-64 shrink-0 flex-col gap-5 overflow-y-auto rounded-xl border bg-background px-4 py-5">
          {/* 방향 버튼 */}
          <div className="flex gap-2">
            <Button
              variant={selectedDirection === 1 ? "default" : "outline"}
              onClick={() => setSelectedDirection(1)}
              className="flex-1"
            >
              방향1 (상단)
            </Button>
            <Button
              variant={selectedDirection === 2 ? "default" : "outline"}
              onClick={() => setSelectedDirection(2)}
              className="flex-1"
            >
              방향2 (하단)
            </Button>
          </div>

          {/* 주차칸 목록 */}
          <div className="space-y-3">
            <h3 className="text-base text-foreground font-bold">주차칸 목록</h3>
            <div className="flex flex-col gap-1">
              {parkingSlots.map((slot) => (
                <Button
                  key={slot}
                  variant="outline"
                  onClick={() => setSelectedSlot(slot)}
                  className={`h-auto w-full justify-between px-2 py-1.5 ${selectedSlot === slot ? "bg-primary hover:bg-primary/90" : "bg-muted-foreground hover:bg-muted-foreground/90"}`}
                >
                  <span className="text-sm text-secondary font-bold tabular-nums">
                    {slot}
                  </span>
                  <Badge variant="outline" className="bg-background">
                    미완료
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* 우측 CCTV 이미지 영역 */}
        <div className="flex flex-1 flex-col gap-5 rounded-xl border bg-background p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold text-foreground">
                {currentCctvLabel} / 방향{selectedDirection} (
                {selectedDirection === 1 ? "상단" : "하단"})
              </h3>
              <span className="text-sm text-muted-foreground">00:00:00</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 min-w-32 rounded-full bg-muted-foreground/20">
                <div className="h-full w-[25%] rounded-full bg-primary" />
              </div>
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                0/615 완료(0%)
              </span>
            </div>
          </div>

          {/* 이미지 컨테이너 */}
          <div className="relative flex-1 overflow-hidden rounded-lg border bg-accent">
            {/* CCTV 이미지 */}
            <img
              src={cctvImage}
              alt="CCTV"
              className="h-full w-full object-contain"
            />

            {/* 우측 상단 컨트롤 버튼 */}
            <div className="absolute right-3 top-3 flex gap-2">
              <Button variant="outline" size="icon" title="새 ROI 그리기">
                <Pencil className="size-4" />
              </Button>
              <Button variant="outline" size="icon" title="그리기 취소">
                <PencilOff className="size-4" />
              </Button>
              <Button variant="outline" size="icon" title="점 취소">
                <Undo2 className="size-4" />
              </Button>
              <Button variant="outline" size="icon" title="ROI 삭제">
                <Trash2 className="size-4" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" title="사용법">
                    <Info className="size-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-64">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">사용법:</h4>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>주차칸을 선택합니다</li>
                      <li>이미지에서 4개의 꼭짓점을 클릭합니다</li>
                      <li>좌상단 → 우상단 → 우하단 → 좌하단 순서</li>
                      <li>4점이 완성되면 자동 저장됩니다</li>
                    </ol>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* 좌측 하단 범례 */}
            <div className="absolute bottom-3 left-3 flex flex-col gap-1 rounded-lg border bg-background px-3 py-2">
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
        </div>
      </div>
    </div>
  );
}
