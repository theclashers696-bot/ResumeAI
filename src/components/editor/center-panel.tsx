"use client";

import { memo, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ResumeData, WorkExperienceItem, EducationItem, SkillItem, ProjectItem, CertificationItem, LanguageItem, AwardItem, AchievementItem, VolunteerItem, PublicationItem, InterestItem, ReferenceItem, CustomSectionItem } from "@/types/resume";
import { PersonalInfoSection } from "./sections/personal-info-section";
import { SummarySection } from "./sections/summary-section";
import { ExperienceSection } from "./sections/experience-section";
import { EducationSection } from "./sections/education-section";
import { SkillsSection } from "./sections/skills-section";
import { ProjectsSection } from "./sections/projects-section";
import { CertificationsSection } from "./sections/certifications-section";
import { LanguagesSection } from "./sections/languages-section";
import { AwardsSection } from "./sections/awards-section";
import { AchievementsSection } from "./sections/achievements-section";
import { VolunteerSection } from "./sections/volunteer-section";
import { PublicationsSection } from "./sections/publications-section";
import { InterestsSection } from "./sections/interests-section";
import { ReferencesSection } from "./sections/references-section";
import { CustomSectionEditor } from "./sections/custom-section-editor";

interface CenterPanelProps {
  data: ResumeData;
  activeSection: string;
  onUpdate: (updates: Partial<ResumeData>) => void;
}

export const CenterPanel = memo(function CenterPanel({
  data,
  activeSection,
  onUpdate,
}: CenterPanelProps) {
  const updatePersonal = useCallback(
    (updates: Partial<ResumeData["personal"]>) =>
      onUpdate({ personal: { ...data.personal, ...updates } }),
    [data.personal, onUpdate]
  );

  const updateWorkExperiences = useCallback(
    (items: WorkExperienceItem[]) => onUpdate({ workExperiences: items }),
    [onUpdate]
  );

  const updateEducations = useCallback(
    (items: EducationItem[]) => onUpdate({ educations: items }),
    [onUpdate]
  );

  const updateSkills = useCallback(
    (items: SkillItem[]) => onUpdate({ skills: items }),
    [onUpdate]
  );

  const updateProjects = useCallback(
    (items: ProjectItem[]) => onUpdate({ projects: items }),
    [onUpdate]
  );

  const updateCertifications = useCallback(
    (items: CertificationItem[]) => onUpdate({ certifications: items }),
    [onUpdate]
  );

  const updateLanguages = useCallback(
    (items: LanguageItem[]) => onUpdate({ languages: items }),
    [onUpdate]
  );

  const updateAwards = useCallback(
    (items: AwardItem[]) => onUpdate({ awards: items }),
    [onUpdate]
  );

  const updateAchievements = useCallback(
    (items: AchievementItem[]) => onUpdate({ achievements: items }),
    [onUpdate]
  );

  const updateVolunteer = useCallback(
    (items: VolunteerItem[]) => onUpdate({ volunteerWork: items }),
    [onUpdate]
  );

  const updatePublications = useCallback(
    (items: PublicationItem[]) => onUpdate({ publications: items }),
    [onUpdate]
  );

  const updateInterests = useCallback(
    (items: InterestItem[]) => onUpdate({ interests: items }),
    [onUpdate]
  );

  const updateReferences = useCallback(
    (items: ReferenceItem[]) => onUpdate({ references: items }),
    [onUpdate]
  );

  const updateCustomSection = useCallback(
    (updated: CustomSectionItem) => {
      const sections = data.customSections.map((cs) =>
        cs.id === updated.id ? updated : cs
      );
      onUpdate({ customSections: sections });
    },
    [data.customSections, onUpdate]
  );

  const renderSection = () => {
    if (activeSection === "personal") {
      return <PersonalInfoSection personal={data.personal} onUpdate={updatePersonal} />;
    }
    if (activeSection === "summary") {
      return (
        <SummarySection
          value={data.personal.summary}
          onChange={(summary) => updatePersonal({ summary })}
        />
      );
    }
    if (activeSection === "experience") {
      return (
        <ExperienceSection
          items={data.workExperiences}
          onUpdate={updateWorkExperiences}
        />
      );
    }
    if (activeSection === "education") {
      return (
        <EducationSection
          items={data.educations}
          onUpdate={updateEducations}
        />
      );
    }
    if (activeSection === "skills") {
      return <SkillsSection items={data.skills} onUpdate={updateSkills} />;
    }
    if (activeSection === "projects") {
      return <ProjectsSection items={data.projects} onUpdate={updateProjects} />;
    }
    if (activeSection === "certifications") {
      return (
        <CertificationsSection
          items={data.certifications}
          onUpdate={updateCertifications}
        />
      );
    }
    if (activeSection === "languages") {
      return <LanguagesSection items={data.languages} onUpdate={updateLanguages} />;
    }
    if (activeSection === "awards") {
      return <AwardsSection items={data.awards} onUpdate={updateAwards} />;
    }
    if (activeSection === "achievements") {
      return (
        <AchievementsSection items={data.achievements} onUpdate={updateAchievements} />
      );
    }
    if (activeSection === "volunteer") {
      return <VolunteerSection items={data.volunteerWork} onUpdate={updateVolunteer} />;
    }
    if (activeSection === "publications") {
      return (
        <PublicationsSection items={data.publications} onUpdate={updatePublications} />
      );
    }
    if (activeSection === "interests") {
      return <InterestsSection items={data.interests} onUpdate={updateInterests} />;
    }
    if (activeSection === "references") {
      return <ReferencesSection items={data.references} onUpdate={updateReferences} />;
    }
    if (activeSection.startsWith("custom-")) {
      const sectionId = activeSection.replace("custom-", "");
      const customSection = data.customSections.find((cs) => cs.id === sectionId);
      if (customSection) {
        return (
          <CustomSectionEditor
            section={customSection}
            onUpdate={updateCustomSection}
          />
        );
      }
    }
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground">Select a section from the left panel to edit it.</p>
      </div>
    );
  };

  return (
    <main className="flex h-full flex-1 flex-col overflow-hidden bg-background">
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-2xl p-6">
          {renderSection()}
        </div>
      </ScrollArea>
    </main>
  );
});
