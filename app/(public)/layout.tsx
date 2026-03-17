export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="app-shell-grid pointer-events-none" />
      <div className="marketing-spotlight pointer-events-none" />
      {children}
    </div>
  );
}
