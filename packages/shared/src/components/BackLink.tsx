import {useRouter} from "next/navigation";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

export const BackLink = ({href = "/"}: { href?: string }) => {
    const router = useRouter()

    return <div className="mb-4 flex mr-[auto]">
        <Button
            variant="secondary"
            onClick={() => router.push(href)}
            className="border-b border-primary cursor-pointer text-md"
        >
            <ArrowLeft className="w-4 h-4" />
            Back
        </Button>
    </div>
}
