import { ReactNode } from 'react'
import LayoutView from './LayoutView'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return <LayoutView>{children}</LayoutView>
}
