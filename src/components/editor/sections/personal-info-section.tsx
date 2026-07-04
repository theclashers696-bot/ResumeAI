/* eslint-disable @next/next/no-img-element */
"use client";

import { memo } from "react";
import { User, Mail, Phone, MapPin, Globe, Github, Linkedin, Twitter, Link2, Camera } from "lucide-react";
import { FieldGroup, SectionCard, SectionHeader } from "@/components/editor/section-ui";
import { FormField } from "@/components/editor/form-field";
import type { PersonalInfo } from "@/types/resume";

interface Props {
  personal: PersonalInfo;
  onUpdate: (updates: Partial<PersonalInfo>) => void;
}

export const PersonalInfoSection = memo(function PersonalInfoSection({ personal, onUpdate }: Props) {
  const set = (key: keyof PersonalInfo) => (value: string) => onUpdate({ [key]: value });

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={User}
        title="Personal Information"
        description="Your basic contact details and identity"
      />

      <SectionCard>
        <div className="space-y-4">
          <FieldGroup label="Full Name" required>
            <FormField
              value={personal.fullName}
              onChange={set("fullName")}
              placeholder="John Doe"
              icon={User}
            />
          </FieldGroup>

          <FieldGroup label="Professional Headline">
            <FormField
              value={personal.headline}
              onChange={set("headline")}
              placeholder="Senior Software Engineer at Acme Corp"
            />
          </FieldGroup>
        </div>
      </SectionCard>

      <SectionCard title="Contact Details">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldGroup label="Email">
            <FormField value={personal.email} onChange={set("email")} placeholder="john@example.com" type="email" icon={Mail} />
          </FieldGroup>
          <FieldGroup label="Phone">
            <FormField value={personal.phone} onChange={set("phone")} placeholder="+1 (555) 000-0000" type="tel" icon={Phone} />
          </FieldGroup>
          <FieldGroup label="Location">
            <FormField value={personal.location} onChange={set("location")} placeholder="New York, NY" icon={MapPin} />
          </FieldGroup>
          <FieldGroup label="Website">
            <FormField value={personal.website} onChange={set("website")} placeholder="https://johndoe.com" type="url" icon={Globe} />
          </FieldGroup>
        </div>
      </SectionCard>

      <SectionCard title="Social & Portfolio">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldGroup label="Portfolio">
            <FormField value={personal.portfolio} onChange={set("portfolio")} placeholder="https://portfolio.com" type="url" icon={Link2} />
          </FieldGroup>
          <FieldGroup label="GitHub">
            <FormField value={personal.github} onChange={set("github")} placeholder="github.com/username" icon={Github} />
          </FieldGroup>
          <FieldGroup label="LinkedIn">
            <FormField value={personal.linkedin} onChange={set("linkedin")} placeholder="linkedin.com/in/username" icon={Linkedin} />
          </FieldGroup>
          <FieldGroup label="Twitter / X">
            <FormField value={personal.twitter} onChange={set("twitter")} placeholder="@username" icon={Twitter} />
          </FieldGroup>
        </div>
      </SectionCard>

      <SectionCard title="Profile Photo">
        <FieldGroup label="Photo URL">
          <FormField
            value={personal.photoUrl}
            onChange={set("photoUrl")}
            placeholder="https://example.com/photo.jpg"
            type="url"
            icon={Camera}
          />
        </FieldGroup>
        {personal.photoUrl && (
          <div className="mt-3 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={personal.photoUrl}
              alt="Profile preview"
              className="h-16 w-16 rounded-full border-2 border-border object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <p className="text-xs text-muted-foreground">Preview of your profile photo</p>
          </div>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          Paste a direct link to your photo. Supported: HTTPS image URLs.
        </p>
      </SectionCard>
    </div>
  );
});
