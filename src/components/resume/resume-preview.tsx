"use client";

import { memo } from "react";
import type { ResumeData } from "@/types/resume";
import { ModernTemplate } from "./templates/modern";
import { ClassicTemplate } from "./templates/classic";
import { MinimalTemplate } from "./templates/minimal";
import { CreativeTemplate } from "./templates/creative";
import { ExecutiveTemplate } from "./templates/executive";
import { CorporateTemplate } from "./templates/corporate";
import { DeveloperTemplate } from "./templates/developer";
import { DesignerTemplate } from "./templates/designer";
import { StudentTemplate } from "./templates/student";
import { BusinessTemplate } from "./templates/business";
import { ElegantTemplate } from "./templates/elegant";
import { ATSTemplate } from "./templates/ats";
import { StartupTemplate } from "./templates/startup";
import { InternationalTemplate } from "./templates/international";
import { BoldTemplate } from "./templates/bold";

interface Props {
  data: ResumeData;
}

export const ResumePreview = memo(function ResumePreview({ data }: Props) {
  switch (data.template) {
    case "classic":        return <ClassicTemplate data={data} />;
    case "minimal":        return <MinimalTemplate data={data} />;
    case "creative":       return <CreativeTemplate data={data} />;
    case "executive":      return <ExecutiveTemplate data={data} />;
    case "corporate":      return <CorporateTemplate data={data} />;
    case "developer":      return <DeveloperTemplate data={data} />;
    case "designer":       return <DesignerTemplate data={data} />;
    case "student":        return <StudentTemplate data={data} />;
    case "business":       return <BusinessTemplate data={data} />;
    case "elegant":        return <ElegantTemplate data={data} />;
    case "ats":            return <ATSTemplate data={data} />;
    case "startup":        return <StartupTemplate data={data} />;
    case "international":  return <InternationalTemplate data={data} />;
    case "bold":           return <BoldTemplate data={data} />;
    default:               return <ModernTemplate data={data} />;
  }
});
