import { useState } from "react";
import { Download, Trash2, Save } from "lucide-react";
import cctvImage from "@/assets/cctv.jpg";
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

const roiList = [
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

export function RoiEditorPage() {
  const [selectedFloor, setSelectedFloor] = useState("b1");
  const [selectedCctv, setSelectedCctv] = useState("1");
  const [isInpainted, setIsInpainted] = useState(true);
  const [selectedDirection] = useState(1);
  const [selectedSlot] = useState("P001");

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

  const handleDeleteRoi = (roiId: string) => {
    console.log("ROI 삭제:", roiId);
  };

  return (
    <div className="flex h-full flex-col gap-5">
      <h2 className="text-[28px] text-foreground font-bold">ROI 에디터</h2>

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
              variant={isInpainted ? "default" : "outline"}
              onClick={() => setIsInpainted(true)}
              className="flex-1"
            >
              Inpainted
            </Button>
            <Button
              variant={!isInpainted ? "default" : "outline"}
              onClick={() => setIsInpainted(false)}
              className="flex-1"
            >
              원본 CCTV
            </Button>
          </div>

          {/* 선택된 정보 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">선택된 방향</span>
              <Badge variant="outline">
                방향 {selectedDirection} (
                {selectedDirection === 1 ? "상단" : "하단"})
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                선택된 주차칸
              </span>
              <Badge variant="outline">{selectedSlot}</Badge>
            </div>
          </div>

          {/* ROI 목록 */}
          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <h3 className="text-sm text-foreground leading-tight pb-2 border-b">
              ROI 목록 ({roiList.length})
            </h3>
            <div className="flex flex-col gap-2 overflow-y-auto">
              {roiList.map((roi) => (
                <div key={roi} className="flex items-center justify-between">
                  <span className="text-sm text-primary font-bold tabular-nums">
                    {roi}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleDeleteRoi(roi)}
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
          <div className="flex flex-col gap-1 px-4 pt-5">
            <h3 className="flex items-center gap-2 text-base font-bold text-foreground leading-tight">
              {currentCctvLabel}
              <Separator orientation="vertical" className="h-3" />
              방향{selectedDirection} (
              {selectedDirection === 1 ? "상단" : "하단"})
            </h3>
          </div>

          {/* 이미지 컨테이너 */}
          <div className="relative flex-1 overflow-hidden">
            {/* CCTV 이미지 */}
            <img
              src={cctvImage}
              alt="CCTV"
              className="h-full w-full object-contain"
            />

            {/* 방향 라벨들 */}
            <span className="absolute top-2 left-2 flex items-center justify-center rounded-sm bg-primary/80 px-2 py-1 text-center text-xs text-secondary tabular-nums">
              방향1 (상단)
            </span>
            <span className="absolute top-[calc(50%+8px)] left-2 flex items-center justify-center rounded-sm bg-primary/80 px-2 py-1 text-center text-xs text-secondary tabular-nums">
              방향2 (하단)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
