import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import Icon from "../../../components/icon/Icon";
import { useStudentStore, type ImportError } from "../../../store/studentStore";

interface StudentImportDialogProps {
  open: boolean;
  onClose: () => void;
}

// Popup to add many students from an Excel file. The backend checks every row;
// if any row has a problem nothing is saved, and the problems are listed here.
const StudentImportDialog = ({ open, onClose }: StudentImportDialogProps) => {
  const downloadTemplate = useStudentStore((state) => state.downloadTemplate);
  const importStudents = useStudentStore((state) => state.importStudents);

  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  // Changing the key clears the file input after closing
  const [inputKey, setInputKey] = useState(0);

  // Start fresh each time the popup closes
  const close = () => {
    if (isUploading) return;
    setFile(null);
    setErrors([]);
    setInputKey((key) => key + 1);
    onClose();
  };

  const upload = async () => {
    if (!file) return;
    setIsUploading(true);
    const result = await importStudents(file);
    setIsUploading(false);

    if (result.ok) {
      // Reset first, then close (close() ignores clicks while uploading)
      setFile(null);
      setErrors([]);
      setInputKey((key) => key + 1);
      onClose();
    } else {
      setErrors(result.errors);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && close()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Students</DialogTitle>
          <DialogDescription>
            Fill in the template and upload it. Class and Section must match the names in the system.
          </DialogDescription>
        </DialogHeader>

        <Button variant="outline" onClick={downloadTemplate} className="justify-self-start">
          <Icon name="Download" size={16} />
          Download Template
        </Button>

        <Input
          key={inputKey}
          type="file"
          accept=".xlsx"
          disabled={isUploading}
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            // Old errors belong to the old file
            setErrors([]);
          }}
        />

        {/* The rows to fix; scrolls when the list is long */}
        {errors.length > 0 && (
          <div className="max-h-60 overflow-y-auto rounded-md border border-destructive/30">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-destructive/10">
                <tr>
                  <th className="px-3 py-2 font-medium">Row</th>
                  <th className="px-3 py-2 font-medium">Problem</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((error, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-3 py-1.5 whitespace-nowrap">{error.row}</td>
                    <td className="px-3 py-1.5 text-destructive">{error.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={close} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={upload} disabled={!file || isUploading}>
            {isUploading ? <Spinner /> : <Icon name="Upload" size={16} />}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudentImportDialog;
