export type LegalSection = { heading: string; paragraphs?: string[]; list?: string[] };
export type LegalLang = "en" | "vi";

export type LegalDoc = {
  updated: string;
  sections: Record<LegalLang, LegalSection[]>;
  /**
   * Sections for paid plans (parent accounts, payments). Written ahead of time,
   * shown only when PAID_PLANS_ENABLED is true.
   */
  paidSections: Record<LegalLang, LegalSection[]>;
};

// Flip when "LLs Plus" launches (and have the texts reviewed first).
export const PAID_PLANS_ENABLED = false;

// TODO: replace with a real contact mailbox before release.
export const CONTACT_EMAIL = "hello@lls.example";
