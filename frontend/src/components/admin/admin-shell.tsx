'use client';

import { LayoutDashboard, ScrollText, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';

import { AdminUserMenu } from '@/components/admin/admin-user-menu';
import { ThemeToggle } from '@/components/marketing/theme-toggle';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { siteConfig } from '@/config/site.config';
import { ADMIN_COPY } from '@/constants/copy/admin';
import { ROUTES } from '@/constants';
import type { UserProfile } from '@/types';

type AdminNavItem = {
  href: string;
  label: string;
  icon: typeof Users;
  children?: readonly { href: string; label: string }[];
};

const ADMIN_NAV: readonly AdminNavItem[] = [
  { href: ROUTES.ADMIN_DASHBOARD, label: ADMIN_COPY.NAV_DASHBOARD, icon: LayoutDashboard },
  { href: ROUTES.ADMIN_USERS, label: ADMIN_COPY.NAV_USERS, icon: Users },
  { href: ROUTES.ADMIN_AUDIT_LOG, label: ADMIN_COPY.NAV_AUDIT, icon: ScrollText },
];

function NavItems({ pathname }: { pathname: string }) {
  return (
    <SidebarMenu>
      {ADMIN_NAV.map((item) => (
        <NavItem key={item.href} item={item} pathname={pathname} />
      ))}
    </SidebarMenu>
  );
}

function NavItem({ item, pathname }: { item: AdminNavItem; pathname: string }) {
  const [open, setOpen] = useState(true);
  const Icon = item.icon;
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

  if (!item.children?.length) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
          <Link href={item.href}>
            <Icon aria-hidden />
            <span>{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        type="button"
        isActive={active}
        tooltip={item.label}
        onClick={() => setOpen((current) => !current)}
      >
        <Icon aria-hidden />
        <span>{item.label}</span>
      </SidebarMenuButton>
      {open ? (
        <SidebarMenuSub>
          {item.children.map((child) => (
            <SidebarMenuSubItem key={child.href}>
              <SidebarMenuSubButton asChild isActive={pathname === child.href}>
                <Link href={child.href}>{child.label}</Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      ) : null}
    </SidebarMenuItem>
  );
}

export function AdminShell({ user, children }: { user: UserProfile; children: ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex flex-col px-2 py-1 group-data-[collapsible=icon]:items-center">
            <span className="truncate text-sm font-semibold">{siteConfig.name}</span>
            <span className="text-muted-foreground text-xs tracking-wide uppercase group-data-[collapsible=icon]:hidden">
              {ADMIN_COPY.PORTAL_LABEL}
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{ADMIN_COPY.GROUP_MAIN}</SidebarGroupLabel>
            <SidebarGroupContent>
              <NavItems pathname={pathname} />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <AdminUserMenu user={user} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger className="size-10" aria-label={ADMIN_COPY.TOGGLE_SIDEBAR} />
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <AdminUserMenu user={user} compact />
          </div>
        </header>
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
