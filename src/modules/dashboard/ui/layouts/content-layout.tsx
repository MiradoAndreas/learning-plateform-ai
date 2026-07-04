import { Navbar } from "../components/navbar";

interface ContentLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function ContentLayout({ title, children }: ContentLayoutProps) {
  return (
    <div>
      <Navbar title={title} />
      <div className="container px-4 pt-8 pb-8 sm:px-8">{children}</div>
    </div>
  );
}
