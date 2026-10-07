// Deep imports keep Vite's dev server from loading all ~1600 lucide icons.
import createElement from "lucide/dist/esm/createElement.js";
import RssIcon from "lucide/dist/esm/icons/rss.js";
import PlusIcon from "lucide/dist/esm/icons/plus.js";
import UsersIcon from "lucide/dist/esm/icons/users.js";
import UserIcon from "lucide/dist/esm/icons/user.js";
import SofaIcon from "lucide/dist/esm/icons/sofa.js";
import CalendarDaysIcon from "lucide/dist/esm/icons/calendar-days.js";
import ClockIcon from "lucide/dist/esm/icons/clock.js";
import FileTextIcon from "lucide/dist/esm/icons/file-text.js";
import ChevronDownIcon from "lucide/dist/esm/icons/chevron-down.js";
import ChevronUpIcon from "lucide/dist/esm/icons/chevron-up.js";

const make = (node) => (size = 24) => createElement(node, { width: size, height: size });

export const Rss = make(RssIcon);
export const Plus = make(PlusIcon);
export const Users = make(UsersIcon);
export const User = make(UserIcon);
export const Sofa = make(SofaIcon);
export const CalendarDays = make(CalendarDaysIcon);
export const Clock = make(ClockIcon);
export const FileText = make(FileTextIcon);
export const ChevronDown = make(ChevronDownIcon);
export const ChevronUp = make(ChevronUpIcon);
