export type Branch = {
  id: string;
  business_id: string;

  name: string;
  username: string | null;

  phone: string | null;

  city: string | null;
  address: string | null;

  latitude: number | null;
  longitude: number | null;

  logo_url: string | null;

  is_active: boolean;

  created_at: string;
  updated_at: string;
};

export type CreateBranchInput = {
  name: string;

  username?: string | null;

  phone?: string | null;

  city?: string | null;
  address?: string | null;

  latitude?: number | null;
  longitude?: number | null;

  logo_url?: string | null;

  is_active?: boolean;
};

export type UpdateBranchInput =
  Partial<CreateBranchInput>;

export type BranchStatus =
  | "active"
  | "inactive";