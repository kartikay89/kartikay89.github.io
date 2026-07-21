import { Badge } from "../ui/Badge";
import type { LifeArea } from "../../types";

const colorMap: Record<string, string> = {
  blue: "text-blue-700 bg-blue-50 border-blue-200",
  purple: "text-purple-700 bg-purple-50 border-purple-200",
  violet: "text-violet-700 bg-violet-50 border-violet-200",
  green: "text-green-700 bg-green-50 border-green-200",
  cyan: "text-cyan-700 bg-cyan-50 border-cyan-200",
  amber: "text-amber-700 bg-amber-50 border-amber-200",
  orange: "text-orange-700 bg-orange-50 border-orange-200",
  gray: "text-gray-700 bg-gray-50 border-gray-200",
};

export function AreaBadge({ area }: { area: LifeArea }) {
  const className = colorMap[area.color] ?? colorMap.gray;
  return <Badge className={className}>{area.name}</Badge>;
}
