import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  formatStr?: string;
}

function DatePicker({
  date,
  onDateChange,
  placeholder = "날짜 선택",
  className,
  formatStr = "yyyy-MM-dd",
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "inline-flex h-9 w-fit items-center justify-start gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground outline-none",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          className,
        )}
      >
        <CalendarIcon className="size-4 shrink-0" />
        <span className="truncate">
          {date ? format(date, formatStr, { locale: ko }) : placeholder}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          locale={ko}
        />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker };
