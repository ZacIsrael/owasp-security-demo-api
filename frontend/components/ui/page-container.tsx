import { ReactNode } from "react";

// Props for wrapping page-level content inside a shared layout container
type PageContainerProps = {
  children: ReactNode;
};

// Provides consistent outer page spacing and centering for full-page layouts
export default function PageContainer({ children }: PageContainerProps) {
  return (
    // Full viewport-height page wrapper with background and responsive padding
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      {/* Centers inner content horizontally and vertically within constrained width */}
      <div className="mx-auto flex min-h-[80vh] w-full max-w-5xl items-center justify-center">
        {/* children = whatever React elements/components are passed between <PageContainer> tags */}
        {children}
      </div>
    </main>
  );
}
