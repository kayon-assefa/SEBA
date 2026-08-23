import { Pin, ShieldAlert } from "lucide-react";
import type { Customer } from "../types/customer";
import CustomerAvatar from "./CustomerAvatar";

type Props = {
  customer: Customer;
  onClick: () => void;
  density: "compact" | "comfortable";
};

export default function CustomerRow({ customer, onClick, density }: Props) {
  const padY = density === "compact" ? "py-2" : "py-4";

  return (
    <tr onClick={onClick} className="cursor-pointer border-b hover:bg-gray-50">
      <td className={`px-4 ${padY}`}>
        <div className="flex items-center gap-3">
          <CustomerAvatar name={customer.name} size={density === "compact" ? "sm" : "md"} />
          <div>
            <div className="flex items-center gap-1.5 font-medium">
              {customer.pinned && <Pin size={13} className="fill-amber-500 text-amber-500" />}
              {customer.blacklisted && <ShieldAlert size={13} className="text-red-500" />}
              {customer.name}
            </div>
            {customer.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {customer.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className={`px-4 ${padY} text-sm text-gray-600`}>{customer.phone || "—"}</td>
      <td className={`px-4 ${padY} text-sm text-gray-600`}>{customer.email || "—"}</td>
      <td className={`px-4 ${padY} text-center text-sm`}>{customer.total_visits}</td>
      <td className={`px-4 ${padY} text-center text-sm`}>{customer.total_orders}</td>
      <td className={`px-4 ${padY} text-sm font-medium`}>
        {customer.total_spent.toLocaleString()} birr
      </td>
      <td className={`px-4 ${padY} text-sm text-gray-500`}>{customer.last_visit || "—"}</td>
    </tr>
  );
}
