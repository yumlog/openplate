import { useState } from "react";
import {
  Download,
  Trash2,
  Save,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import cctvImage from "@/assets/cctv.jpg";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
  const [selectedCctv, setSelectedCctv] = useState("");
  const [isInpainted, setIsInpainted] = useState(true);
  const [selectedDirection] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
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
          {selectedCctv ? (
            <>
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

              {isInpainted ? (
                <div className="bg-secondary/6 p-3 rounded-lg text-foreground">
                  <h4 className="text-sm font-bold">Inpainted 모드</h4>
                  <p className="text-xs mt-2 mb-1">
                    차량 없는 참조 이미지로 ROI 그리기
                  </p>
                  <ul className="text-xs space-y-1">
                    <li>- CCTV 선택 → 주차칸 ID 입력</li>
                    <li>- 4점 클릭 → 서버에 저장</li>
                  </ul>
                </div>
              ) : (
                <>
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
                          setCurrentImage((prev) =>
                            Math.min(totalImages, prev + 1),
                          )
                        }
                      >
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="bg-secondary/6 p-3 rounded-lg text-foreground">
                    <h4 className="text-sm font-bold">원본 CCTV 모드</h4>
                    <p className="text-xs mt-2 mb-1">
                      실제 영상으로 ROI 검증/수정
                    </p>
                    <ul className="text-xs space-y-1">
                      <li>- 타임라인으로 시간대 탐색</li>
                      <li>- ROI-주차상태 불일치 확인</li>
                      <li>- ROI 클릭 → 점 드래그로 수정</li>
                    </ul>
                  </div>
                </>
              )}

              {/* ROI 목록 */}
              <div className="flex min-h-0 flex-1 flex-col gap-2">
                <h3 className="text-sm text-foreground leading-tight pb-2 border-b">
                  ROI 목록 ({roiList.length})
                </h3>
                <div className="flex flex-col gap-2 overflow-y-auto">
                  {roiList.map((roi) => (
                    <div
                      key={roi}
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setSelectedSlot(roi)}
                    >
                      <span
                        className={`text-sm font-bold tabular-nums ${selectedSlot === roi ? "text-primary" : "text-secondary-foreground"}`}
                      >
                        {roi}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRoi(roi);
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
              ROI 목록이 표시됩니다.
            </p>
          )}
        </div>

        {/* 우측 CCTV 이미지 영역 */}
        <div className="flex flex-1 flex-col gap-5 rounded-xl border bg-background">
          {selectedCctv ? (
            <>
              <div className="flex flex-col gap-1 px-4 pt-5">
                <h3 className="flex items-center gap-2 text-base font-bold text-foreground leading-tight">
                  {currentCctvLabel}
                  <Separator orientation="vertical" className="h-3" />
                  방향{selectedDirection} (
                  {selectedDirection === 1 ? "상단" : "하단"})
                  {selectedSlot && (
                    <>
                      <Separator orientation="vertical" className="h-3" />
                      {selectedSlot}
                    </>
                  )}
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
    </div>
  );
}
