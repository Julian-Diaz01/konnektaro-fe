import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ConfirmDeleteButtonProps = {
  name: string;
  onConfirm: () => void;
  buttonText?: string;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "destructiveOutline";
};

export function ConfirmDeleteButton({
  name,
  onConfirm,
  buttonText = "Delete",
  buttonVariant = "destructive",
}: ConfirmDeleteButtonProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false); // State to track the dialog open status

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="text-md" variant={buttonVariant}>{buttonText}</Button>
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
          <Button className="text-md" variant="outlinePrimary" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            className="text-md"
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
