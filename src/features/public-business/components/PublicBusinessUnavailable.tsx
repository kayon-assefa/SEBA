export function PublicBusinessUnavailable() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 text-5xl">◌</div>

        <h1 className="text-3xl font-semibold tracking-tight">
          Currently Unavailable
        </h1>

        <p className="mt-3 text-muted-foreground">
          This business is currently unavailable.
          Please check back later.
        </p>
      </div>
    </main>
  );
}
