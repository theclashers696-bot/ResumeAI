"use client";

import { memo, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import {
  User, FileText, Briefcase, GraduationCap, Star, FolderOpen,
  Award, Globe, Trophy, Heart, BookOpen, Lightbulb, Users,
  GripVertical, Plus, ChevronRight, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ResumeData } from "@/types/resume";

const SECTION_META: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  personal: { icon: User, label: "Personal Info", color: "text-blue-500" },
  summary: { icon: FileText, label: "Summary", color: "text-purple-500" },
  experience: { icon: Briefcase, label: "Experience", color: "text-orange-500" },
  education: { icon: GraduationCap, label: "Education", color: "text-green-500" },
  skills: { icon: Star, label: "Skills", color: "text-yellow-500" },
  projects: { icon: FolderOpen, label: "Projects", color: "text-cyan-500" },
  certifications: { icon: Award, label: "Certifications", color: "text-red-500" },
  languages: { icon: Globe, label: "Languages", color: "text-indigo-500" },
  awards: { icon: Trophy, label: "Awards", color: "text-amber-500" },
  achievements: { icon: Trophy, label: "Achievements", color: "text-pink-500" },
  volunteer: { icon: Heart, label: "Volunteer Work", color: "text-rose-500" },
  publications: { icon: BookOpen, label: "Publications", color: "text-teal-500" },
  interests: { icon: Lightbulb, label: "Interests", color: "text-lime-500" },
  references: { icon: Users, label: "References", color: "text-violet-500" },
};

interface SortableSectionItemProps {
  id: string;
  label: string;
  icon: React.ElementType;
  iconColor: string;
  isActive: boolean;
  count?: number;
  onClick: () => void;
}

function SortableSectionItem({
  id,
  label,
  icon: Icon,
  iconColor,
  isActive,
  count,
  onClick,
}: SortableSectionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative">
      <button
        onClick={onClick}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-all",
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
        aria-label={`Edit ${label} section`}
      >
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50" />
        </span>
        <Icon className={cn("h-4 w-4 shrink-0", iconColor)} />
        <span className="flex-1 truncate">{label}</span>
        {count !== undefined && count > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-muted px-1 text-[10px] font-medium text-muted-foreground">
            {count}
          </span>
        )}
        {isActive && <ChevronRight className="h-3 w-3 shrink-0" />}
      </button>
    </div>
  );
}

function CustomSectionItem({
  id,
  title,
  isActive,
  onClick,
}: {
  id: string;
  title: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative">
      <button
        onClick={onClick}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-all",
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50" />
        </span>
        <Layers className="h-4 w-4 shrink-0 text-slate-500" />
        <span className="flex-1 truncate">{title}</span>
        {isActive && <ChevronRight className="h-3 w-3 shrink-0" />}
      </button>
    </div>
  );
}

interface LeftPanelProps {
  data: ResumeData;
  activeSection: string;
  onSectionClick: (section: string) => void;
  onSectionReorder: (newOrder: string[]) => void;
  onAddCustomSection: () => void;
}

function getSectionCount(data: ResumeData, section: string): number | undefined {
  switch (section) {
    case "experience": return data.workExperiences.length;
    case "education": return data.educations.length;
    case "skills": return data.skills.length;
    case "projects": return data.projects.length;
    case "certifications": return data.certifications.length;
    case "languages": return data.languages.length;
    case "awards": return data.awards.length;
    case "achievements": return data.achievements.length;
    case "volunteer": return data.volunteerWork.length;
    case "publications": return data.publications.length;
    case "interests": return data.interests.length;
    case "references": return data.references.length;
    default: return undefined;
  }
}

export const LeftPanel = memo(function LeftPanel({
  data,
  activeSection,
  onSectionClick,
  onSectionReorder,
  onAddCustomSection,
}: LeftPanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const allSectionIds = useMemo(() => {
    const base = ["personal", ...data.sectionOrder];
    const customIds = data.customSections.map((cs) => `custom-${cs.id}`);
    return [...base, ...customIds];
  }, [data.sectionOrder, data.customSections]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === "personal" || overId === "personal") return;

    const currentOrder = [...data.sectionOrder];
    const customIds = data.customSections.map((cs) => `custom-${cs.id}`);

    const activeInOrder = currentOrder.includes(activeId);
    const overInOrder = currentOrder.includes(overId);

    if (activeInOrder && overInOrder) {
      const oldIndex = currentOrder.indexOf(activeId);
      const newIndex = currentOrder.indexOf(overId);
      const newOrder = [...currentOrder];
      newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, activeId);
      onSectionReorder(newOrder);
    }
  }

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="flex h-12 shrink-0 items-center border-b border-sidebar-border px-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/50">
          Sections
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={allSectionIds} strategy={verticalListSortingStrategy}>
            {/* Personal info is always first & not reorderable */}
            <SortableSectionItem
              id="personal"
              label="Personal Info"
              icon={SECTION_META.personal.icon}
              iconColor={SECTION_META.personal.color}
              isActive={activeSection === "personal"}
              onClick={() => onSectionClick("personal")}
            />

            <div className="my-1.5 h-px bg-sidebar-border" />

            {data.sectionOrder.map((section) => {
              const meta = SECTION_META[section];
              if (!meta) return null;
              return (
                <SortableSectionItem
                  key={section}
                  id={section}
                  label={meta.label}
                  icon={meta.icon}
                  iconColor={meta.color}
                  isActive={activeSection === section}
                  count={getSectionCount(data, section)}
                  onClick={() => onSectionClick(section)}
                />
              );
            })}

            {data.customSections.map((cs) => (
              <CustomSectionItem
                key={cs.id}
                id={`custom-${cs.id}`}
                title={cs.title}
                isActive={activeSection === `custom-${cs.id}`}
                onClick={() => onSectionClick(`custom-${cs.id}`)}
              />
            ))}
          </SortableContext>
        </DndContext>

        <div className="mt-2 border-t border-sidebar-border pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={onAddCustomSection}
          >
            <Plus className="h-4 w-4" />
            <span className="text-xs">Add Custom Section</span>
          </Button>
        </div>
      </div>
    </aside>
  );
});
