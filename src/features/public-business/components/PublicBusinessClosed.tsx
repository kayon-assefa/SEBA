import type {
  PublicBusiness,
  PublicBusinessStatus,
} from "../types/publicBusiness";

interface PublicBusinessClosedProps {
  business: PublicBusiness;
  status: PublicBusinessStatus;
}

export function PublicBusinessClosed({
  business,
  status,
}: PublicBusinessClosedProps) {
  const temporarilyClosed = status === "temporarily_closed";

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-12">
        <div className="w-full rounded-3xl border bg-card p-8 text-center shadow-sm">
          {business.logoUrl && (
            <img
              src={business.logoUrl}
              alt={business.name}
              className="mx-auto mb-6 h-20 w-20 rounded-2xl object-cover"
            />
          )}

          <h1 className="text-3xl font-semibold tracking-tight">
            {business.name}
          </h1>

          <div className="mt-6">
            <p className="text-lg font-medium">
              {temporarilyClosed ? "Currently Closed" : "Closed"}
            </p>

            <p className="mt-2 text-muted-foreground">
              {temporarilyClosed
                ? "This business is temporarily unavailable."
                : "This business is currently outside its working hours."}
            </p>
          </div>

          {business.location?.city && (
            <p className="mt-6 text-sm text-muted-foreground">
              {business.location.address
                ? `${business.location.address}, ${business.location.city}`
                : business.location.city}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
