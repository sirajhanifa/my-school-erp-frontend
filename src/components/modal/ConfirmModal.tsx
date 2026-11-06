import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import Modal from "./Modal";

type ConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  // Runs when the user clicks the confirm button; the page closes the modal when it is done
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
  confirmLabel?: string;
};

// A small "Are you sure?" popup, used before deleting something.
const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Delete",
}: ConfirmModalProps) => {
  // true while onConfirm runs, so the buttons cannot be clicked twice
  const [isWorking, setIsWorking] = useState(false);

  const handleConfirm = async () => {
    setIsWorking(true);
    try {
      await onConfirm();
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <Modal
      open={open}
      // Do not close halfway through the action
      onClose={() => !isWorking && onClose()}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="lg" onClick={onClose} disabled={isWorking} className="min-w-24">
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="lg"
            onClick={handleConfirm}
            disabled={isWorking}
            aria-busy={isWorking}
            className="min-w-24"
          >
            {isWorking && <Spinner />}
            {isWorking ? "Please wait..." : confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-muted-foreground">{message}</p>
    </Modal>
  );
};

export default ConfirmModal;
