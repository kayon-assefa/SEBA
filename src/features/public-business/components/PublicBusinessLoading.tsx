export function PublicBusinessLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-24 w-24 rounded-full bg-muted" />
          <div className="space-y-3">
            <div className="h-8 w-64 rounded bg-muted" />
            <div className="h-4 w-96 max-w-full rounded bg-muted" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-48 rounded-2xl bg-muted" />
            <div className="h-48 rounded-2xl bg-muted" />
            <div className="h-48 rounded-2xl bg-muted" />
          </div>
        </div>
      </div>
    </main>
  );
}
