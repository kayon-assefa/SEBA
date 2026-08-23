type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export default function AnalyticsSection({
  title,
  description,
  children,
  className = "",
}: Props) {
  return (
    <section
      className={`rounded-2xl border border-gray-200 bg-white p-5 md:p-6 ${className}`}
    >
      <div className="mb-5">
        <h2 className="text-lg font-bold text-[#2B2B2B]">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-gray-500">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}