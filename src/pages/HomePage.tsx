export function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">홈</h1>
      <p className="text-muted-foreground">OpenPlate에 오신 것을 환영합니다.</p>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-6 bg-background rounded-lg border">
          <h3 className="font-semibold text-foreground">지도</h3>
          <p className="text-sm text-muted-foreground mt-1">
            위치 데이터 시각화
          </p>
        </div>
        <div className="p-6 bg-background rounded-lg border">
          <h3 className="font-semibold text-foreground">타임라인</h3>
          <p className="text-sm text-muted-foreground mt-1">
            시간별 데이터 분석
          </p>
        </div>
        <div className="p-6 bg-background rounded-lg border">
          <h3 className="font-semibold text-foreground">커버리지</h3>
          <p className="text-sm text-muted-foreground mt-1">범위 현황 확인</p>
        </div>
      </div>
    </div>
  );
}
