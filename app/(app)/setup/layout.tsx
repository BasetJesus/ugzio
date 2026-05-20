export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--bg-base)] p-4">
      {children}
    </div>
  )
}
