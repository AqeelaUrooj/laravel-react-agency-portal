import { usePage } from '@inertiajs/react';
import { Moon, Sun } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useAppearance } from '@/hooks/use-appearance';
import { ClientAvatar } from '@/components/clients/shared';
import type { BreadcrumbItem } from '@/types';
export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItem[];
}) {
    const { auth } = usePage().props;
    const { resolvedAppearance, updateAppearance } = useAppearance();
    return (
        <header className="flex h-18 shrink-0 items-center justify-between gap-3 border-b bg-card/80 px-4 sm:px-8">
            <div className="flex items-center gap-3">
                <SidebarTrigger />
                <span className="h-5 border-l" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Switch to ${resolvedAppearance === 'dark' ? 'light' : 'dark'} mode`}
                    onClick={() =>
                        updateAppearance(
                            resolvedAppearance === 'dark' ? 'light' : 'dark',
                        )
                    }
                >
                    {resolvedAppearance === 'dark' ? (
                        <Sun className="size-4" />
                    ) : (
                        <Moon className="size-4" />
                    )}
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            aria-label="Open profile menu"
                            className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <ClientAvatar name={auth.user.name} />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-56">
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
