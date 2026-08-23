import type { PublicBusiness } from "../types/publicBusiness";
import { ModernTemplate } from "./modern/ModernTemplate";
import { EditorialTemplate } from "./editorial/EditorialTemplate";
import { BoldTemplate } from "./bold/BoldTemplate";
import { MinimalTemplate } from "./minimal/MinimalTemplate";

interface TemplateRendererProps {
  business: PublicBusiness;
}

export function TemplateRenderer({ business }: TemplateRendererProps) {
  switch (business.template) {
    case "modern":
      return <ModernTemplate business={business} />;

    case "editorial":
      return <EditorialTemplate business={business} />;

    case "bold":
      return <BoldTemplate business={business} />;

    case "minimal":
      return <MinimalTemplate business={business} />;

    default:
      return <ModernTemplate business={business} />;
  }
}
