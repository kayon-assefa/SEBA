import { Plus } from "lucide-react";

type Props = {
  onClick: () => void;
};

export default function AddOrderButton({
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
    >
      <Plus size={18} />
      Add Order
    </button>
  );
}