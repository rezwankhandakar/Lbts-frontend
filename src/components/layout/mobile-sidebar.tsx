import { AppSidebar } from '@/components/layout/app-sidebar'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface MobileSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        id="app-sidebar-drawer"
        side="left"
        className="w-[17rem] gap-0 bg-sidebar p-0 sm:max-w-[17rem]"
        showCloseButton={false}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Links to each module in the application.</SheetDescription>
        </SheetHeader>
        <AppSidebar onNavigate={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  )
}
