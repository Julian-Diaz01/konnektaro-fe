import React from "react";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

type ConfirmDeleteButtonProps = {
  name: string;
  onConfirm: () => void;
  buttonText?: string;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "destructiveOutline";
  mode?: "button" | "icon";
  iconSize?: number;
};

export function ConfirmDeleteButton({
  name,
  onConfirm,
  buttonText = "Delete",
  buttonVariant = "destructive",
  mode = "button",
  iconSize = 20,
}: ConfirmDeleteButtonProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false); // State to track the dialog open status

  const triggerElement = mode === "icon" ? (
    <div className="cursor-pointer hover:opacity-80 transition-opacity p-2">
      <Trash2 size={iconSize} className="text-red-500" />
    </div>
  ) : (
    <Button variant={buttonVariant}>{buttonText}</Button>
  );

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {triggerElement}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the{" "}
            <strong>{name}</strong>.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outlinePrimary" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              setDialogOpen(false)
            }}
          >
            Confirm Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
