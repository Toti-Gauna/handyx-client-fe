import { MarcoApp } from '@/components/MarcoApp';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <MarcoApp barra>{children}</MarcoApp>;
}
