import { index as projectsIndex } from '@/routes/projects';
import { Link } from '@inertiajs/react';
import {
    LayoutGrid,
    Users,
    FolderKanban,
    CheckSquare,
    Files,
    CreditCard,
    Settings,
    Layers,
} from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index } from '@/routes/clients';
import { edit } from '@/routes/profile';
export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader className="px-3 py-6">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()}>
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-white">
                                    <Layers className="size-5" />
                                </div>
                                <div className="grid text-left group-data-[collapsible=icon]:hidden">
                                    <span className="text-base font-semibold tracking-tight">
                                        Atelier
                                        <span className="text-indigo-400">
                                            .
                                        </span>
                                    </span>
                                    <span className="text-[10px] tracking-widest text-slate-400">
                                        AGENCY WORKSPACE
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain
                    items={[
                        {
                            title: 'Dashboard',
                            href: dashboard(),
                            icon: LayoutGrid,
                        },
                        { title: 'Clients', href: index(), icon: Users },
                        {
                            title: 'Projects',
                            href: projectsIndex(),
                            icon: FolderKanban,
                        },
                    ]}
                />
                <SidebarGroup>
                    <SidebarGroupLabel>Coming next</SidebarGroupLabel>
                    <SidebarMenu>
                        {[
                            { title: 'Tasks', icon: CheckSquare },
                            { title: 'Documents', icon: Files },
                            { title: 'Billing', icon: CreditCard },
                        ].map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    disabled
                                    tooltip={`${item.title} — Coming soon`}
                                    className="opacity-50"
                                >
                                    <item.icon />
                                    <span>{item.title}</span>
                                    <span className="ml-auto text-[9px] group-data-[collapsible=icon]:hidden">
                                        SOON
                                    </span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="gap-4 p-3">
                <NavMain
                    items={[
                        { title: 'Settings', href: edit(), icon: Settings },
                    ]}
                />
                <div className="border-t border-sidebar-border pt-3">
                    <NavUser />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
