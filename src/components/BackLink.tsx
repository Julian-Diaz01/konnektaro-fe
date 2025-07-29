import {useRouter} from "next/navigation";

export const BackLink = ({href = "/"}: { href?: string }) => {
    const router = useRouter()

    return <div className="mb-4 flex mr-[auto]">
        <a
            onClick={() => router.push(href)}
            className="border-b border-primary text-primary cursor-pointer"
        >
            {"< Back"}
        </a>
    </div>
}
