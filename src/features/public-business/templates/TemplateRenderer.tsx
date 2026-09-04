import type { PublicBusiness } from "../types/publicBusiness";
import { ModernTemplate } from "./modern/ModernTemplate";
import { EditorialTemplate } from "./editorial/EditorialTemplate";
import { BoldTemplate } from "./bold/BoldTemplate";
import { MinimalTemplate } from "./minimal/MinimalTemplate";
import { PublicBusinessSeo } from "../components/PublicBusinessSeo";
import { PublicTemplateExperience } from "../components/PublicTemplateExperience";

interface TemplateRendererProps { business: PublicBusiness; }

export function TemplateRenderer({ business }: TemplateRendererProps) {
  const template = (() => {
    switch (business.template) {
      case "editorial": return <EditorialTemplate business={business} />;
      case "bold": return <BoldTemplate business={business} />;
      case "minimal": return <MinimalTemplate business={business} />;
      case "modern":
      default: return <ModernTemplate business={business} />;
    }
  })();

  return (
    <PublicTemplateExperience business={business}>
      <PublicBusinessSeo business={business} />
      {template}
    </PublicTemplateExperience>
  );
}
