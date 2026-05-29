import LayoutWrapper from '@/components/layout-wrapper';

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutWrapper>
        {children}
    </LayoutWrapper>
  )
}

export default DashboardLayout