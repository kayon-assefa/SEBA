export function PublicBusinessNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 text-6xl">404</div>

        <h1 className="text-3xl font-semibold tracking-tight">
          Business Not Found
        </h1>

        <p className="mt-3 text-muted-foreground">
          We couldn't find the business you're looking for.
          Please check the URL and try again.
        </p>

        <a
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Go to SEBA
        </a>
      </div>
    </main>
  );
}
