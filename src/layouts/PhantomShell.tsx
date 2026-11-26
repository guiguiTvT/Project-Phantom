import type { ReactNode } from 'react';
import { BottomBar } from '@/components/os/BottomBar';
import { MobileNav } from '@/components/os/MobileNav';
import { RightRail } from '@/components/os/RightRail';
import { SideNav } from '@/components/os/SideNav';
import { TopBar } from '@/components/os/TopBar';

export default function PhantomShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <SideNav />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <MobileNav />
          <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
        </div>
        <RightRail />
      </div>
      <BottomBar />
    </div>
  );
}
