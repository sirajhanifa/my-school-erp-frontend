import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Icon from "../icon/Icon";

export interface NotificationItem {
  id: string;
  title: string;
  time: string; // already formatted, e.g. "5 min ago"
  isRead: boolean;
}

interface NotificationMenuProps {
  items?: NotificationItem[];
}

// Bell icon with a dropdown list of notifications.
// There is no notifications API yet, so by default the list is empty.
const NotificationMenu = ({ items = [] }: NotificationMenuProps) => {
  const unreadCount = items.filter((item) => !item.isRead).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-lg" aria-label="Notifications" className="relative text-muted-foreground" />
        }
      >
        <Icon name="Bell" size={20} />
        {/* Red dot only when something is unread */}
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)] p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold">Notifications</span>
          {unreadCount > 0 && <Badge variant="secondary">{unreadCount} new</Badge>}
        </div>
        <DropdownMenuSeparator className="mx-0 my-0" />

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-muted-foreground">
            <Icon name="BellOff" size={24} />
            <p className="text-sm">No new notifications</p>
          </div>
        ) : (
          <ul className="max-h-80 divide-y overflow-y-auto">
            {items.map((item) => (
              <li key={item.id} className={`px-4 py-3 ${item.isRead ? "" : "bg-primary/5"}`}>
                <p className="text-sm">{item.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.time}</p>
              </li>
            ))}
          </ul>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationMenu;
