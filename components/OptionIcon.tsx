import {
  Activity,
  Baby,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  CalendarX2,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  CircleHelp,
  Clock3,
  FlaskConical,
  HeartHandshake,
  Hourglass,
  Lock,
  Microscope,
  Pill,
  Ribbon,
  ShieldCheck,
  Sprout,
  Stethoscope,
  Syringe,
  type LucideIcon,
} from "lucide-react";
import type { OptionIcon as OptionIconName } from "@/lib/questions";

const ICONS: Record<OptionIconName, LucideIcon> = {
  sprout: Sprout,
  calendar: CalendarDays,
  "calendar-range": CalendarRange,
  "calendar-clock": CalendarClock,
  hourglass: Hourglass,
  "calendar-check": CalendarCheck,
  "calendar-x": CalendarX2,
  help: CircleHelp,
  stethoscope: Stethoscope,
  activity: Activity,
  ribbon: Ribbon,
  microscope: Microscope,
  shield: ShieldCheck,
  "circle-dashed": CircleDashed,
  baby: Baby,
  "heart-hand": HeartHandshake,
  lock: Lock,
  pill: Pill,
  syringe: Syringe,
  flask: FlaskConical,
  check: CircleCheck,
  alert: CircleAlert,
  clock: Clock3,
};

export function OptionIcon({ name, className }: { name: OptionIconName; className?: string }) {
  const Icon = ICONS[name];
  return <Icon className={className} strokeWidth={1.8} aria-hidden />;
}
