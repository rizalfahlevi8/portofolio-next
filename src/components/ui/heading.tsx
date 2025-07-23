import { SidebarTrigger } from "./sidebar"

interface HeadingProps {
    title: string
    description?: string
}

export const Heading: React.FC<HeadingProps> = ({
    title,
    description
}) => {
    return (
        <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
                {description && (
                    <p className="text-sm text-muted-foreground leading-none">{description}</p>
                )}
            </div>
        </div>
    )
}
