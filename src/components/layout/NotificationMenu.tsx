import { useCallback, useRef, useState } from "react";
import Icon from "../icon/Icon";
import useClickOutside from "./useClickOutside";

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
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setIsOpen(false), []);
  useClickOutside(containerRef, close, isOpen);

  const unreadCount = items.filter((item) => !item.isRead).length;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      >
        <Icon name="Bell" size={20} />
        {/* Red dot only when something is unread */}
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span className="text-sm font-semibold text-slate-900">Notifications</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                {unreadCount} new
              </span>
            )}
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-slate-400">
              <Icon name="BellOff" size={24} />
              <p className="text-sm">No new notifications</p>
            </div>
          ) : (
            <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
              {items.map((item) => (
                <li key={item.id} className={`px-4 py-3 ${item.isRead ? "" : "bg-blue-50/50"}`}>
                  <p className="text-sm text-slate-800">{item.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{item.time}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationMenu;
