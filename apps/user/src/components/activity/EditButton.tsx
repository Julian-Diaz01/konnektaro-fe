import {Button} from "@shared/components/ui/button"

interface EditButtonProps {
    onClick: () => void
}

export function EditButton({onClick}: EditButtonProps) {
    return (
        <div className="flex justify-center max-w-screen-md mx-auto px-0 w-full">
            <Button
                onClick={onClick}
                className="bg-[var(--primary)] hover:bg-[var(--terciary)] w-full text-white px-0 py-2 rounded-lg h-[44px]"
            >
                Edit Answer
            </Button>
        </div>
    )
}

