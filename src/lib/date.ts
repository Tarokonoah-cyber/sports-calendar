import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

export function formatTaiwanDate(date: Date, pattern: string) {
  return format(date, pattern, { locale: zhTW });
}
