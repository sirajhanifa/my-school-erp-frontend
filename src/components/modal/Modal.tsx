import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type ModalSize = "sm" | "md" | "lg" | "full";

type ModalProps = {
  open: boolean;
  // Called on the X button, Esc, or a click outside the modal
  onClose: () => void;
  title: string;
  description?: string;
  size?: ModalSize;
  children?: ReactNode;
  // Buttons shown at the bottom, e.g. Cancel and Save
  footer?: ReactNode;
};

// Width of each size from tablets up. On phones every size fills the screen, minus a small margin.
const sizeClassNames: Record<ModalSize, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-lg",
  lg: "sm:max-w-3xl",
  full: "sm:max-w-[calc(100%-2rem)]",
};

// A popup with a title, optional description, any content, and optional footer buttons.
// Usage: <Modal open={isOpen} onClose={close} title="Edit" footer={<Button>Save</Button>}>...</Modal>
const Modal = ({ open, onClose, title, description, size = "md", children, footer }: ModalProps) => {
  return (
    // Only tell the page when the modal wants to close; the page decides by changing "open"
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      {/* flex column + max height: long content scrolls in the body while header and footer stay visible */}
      <DialogContent
        className={`flex max-h-[calc(100dvh-2rem)] flex-col gap-0 p-0 ${sizeClassNames[size]}`}
      >
        {/* pr-12 leaves room for the close button in the top-right corner */}
        <DialogHeader className="border-b px-5 py-4 pr-12 sm:px-6">
          <DialogTitle className="text-lg leading-snug font-semibold">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {children && (
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 text-sm sm:px-6">{children}</div>
        )}

        {/* Phones: full-width buttons stacked, main action on top. From "sm" up: one row on the right. */}
        {footer && <DialogFooter className="m-0 px-5 py-4 sm:px-6">{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
