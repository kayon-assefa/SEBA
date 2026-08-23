import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Users2 } from "lucide-react";
import toast from "react-hot-toast";

import CustomerTable from "../components/CustomerTable";
import CustomerFilters from "../components/CustomerFilters";
import CustomerDrawer from "../components/CustomerDrawer";
import CustomerFormModal from "../components/CustomerFormModal";
import DuplicateBanner from "../components/DuplicateBanner";
import MergeCustomersModal from "../components/MergeCustomersModal";

import { customerService } from "../services/customer.service";
import type { Customer, CustomerFilters as Filters, DuplicateCandidate } from "../types/customer";

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<Filters>({ search: "", tag: null, segment: "all" });
  const [density, setDensity] = useState<"compact" | "comfortable">("comfortable");

  const [selected, setSelected] = useState<Customer | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([]);
  const [dismissedDuplicates, setDismissedDuplicates] = useState(false);
  const [mergingCandidate, setMergingCandidate] = useState<DuplicateCandidate | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  async function loadCustomers() {
    setLoading(true);
    try {
      const data = await customerService.getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error("Customers load error:", err);
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    customerService
      .findDuplicateCandidates()
      .then(setDuplicates)
      .catch((err) => console.error("Duplicate check error:", err));
  }, [customers.length]);

  // Keyboard shortcuts: "n" for new customer, "/" to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isTyping = ["INPUT", "TEXTAREA"].includes(target.tagName);
      if (isTyping) return;

      if (e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "n") {
        e.preventDefault();
        setEditingCustomer(null);
        setShowFormModal(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    customers.forEach((c) => c.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    let result = customers;

    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.phone ?? "").toLowerCase().includes(q) ||
          (c.email ?? "").toLowerCase().includes(q)
      );
    }

    if (filters.tag) {
      result = result.filter((c) => c.tags.includes(filters.tag!));
    }

    switch (filters.segment) {
      case "pinned":
        result = result.filter((c) => c.pinned);
        break;
      case "vip":
        result = result.filter((c) => c.tags.includes("VIP"));
        break;
      case "blacklisted":
        result = result.filter((c) => c.blacklisted);
        break;
      case "inactive":
        result = result.filter((c) => {
          if (!c.last_visit) return false;
          const days = Math.floor((Date.now() - new Date(c.last_visit).getTime()) / 86400000);
          return days > 60;
        });
        break;
    }

    return [...result].sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1));
  }, [customers, filters]);

  function handleSaved(customer: Customer) {
    setCustomers((prev) => {
      const exists = prev.some((c) => c.id === customer.id);
      return exists ? prev.map((c) => (c.id === customer.id ? customer : c)) : [customer, ...prev];
    });
  }

  function handleUpdatedInDrawer(customer: Customer) {
    setSelected(customer);
    handleSaved(customer);
  }

  function handleReviewDuplicate(candidate: DuplicateCandidate) {
    setMergingCandidate(candidate);
  }

  function handleMerged(survivor: Customer) {
    setCustomers((prev) => {
      const withoutDuplicate = prev.filter(
        (c) => c.id !== mergingCandidate?.customerA.id && c.id !== mergingCandidate?.customerB.id
      );
      return [survivor, ...withoutDuplicate];
    });
  }

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users2 size={22} />
          <h1 className="text-xl font-bold">Customers</h1>
          <span className="text-sm text-gray-400">({customers.length})</span>
        </div>
        <button
          onClick={() => {
            setEditingCustomer(null);
            setShowFormModal(true);
          }}
          className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {!dismissedDuplicates && (
        <DuplicateBanner
          candidates={duplicates}
          onReview={handleReviewDuplicate}
          onDismiss={() => setDismissedDuplicates(true)}
        />
      )}

      <CustomerFilters
        filters={filters}
        onChange={setFilters}
        allTags={allTags}
        density={density}
        onDensityChange={setDensity}
        searchInputRef={searchInputRef}
      />

      <CustomerTable
        customers={filteredCustomers}
        loading={loading}
        density={density}
        onSelect={setSelected}
        onAddFirst={() => {
          setEditingCustomer(null);
          setShowFormModal(true);
        }}
      />

      <CustomerDrawer
        customer={selected}
        open={selected !== null}
        onClose={() => setSelected(null)}
        onUpdated={handleUpdatedInDrawer}
      />

      <CustomerFormModal
        open={showFormModal}
        editingCustomer={editingCustomer}
        onClose={() => setShowFormModal(false)}
        onSaved={handleSaved}
      />

      <MergeCustomersModal
        candidate={mergingCandidate}
        onClose={() => setMergingCandidate(null)}
        onMerged={handleMerged}
      />
    </div>
  );
}
