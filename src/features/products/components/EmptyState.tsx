type Props = {
  hasSearch: boolean;
  onAdd: () => void;
};

export default function EmptyState({ hasSearch, onAdd }: Props) {
  if (hasSearch) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
        <div className="text-4xl">🔎</div>
        <h3 className="mt-4 font-semibold text-[#2B2B2B]">No products found</h3>
        <p className="mt-1 max-w-sm text-sm text-gray-500">
          Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F25F5C]/10 text-3xl">📦</div>
      <h3 className="mt-5 text-lg font-bold text-[#2B2B2B]">No products yet</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
        Add your first product or service to start managing your catalog.
      </p>
      <button onClick={onAdd} className="mt-5 rounded-xl bg-[#F25F5C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#e14e4b]">
        Add your first product
      </button>
    </div>
  );
}
