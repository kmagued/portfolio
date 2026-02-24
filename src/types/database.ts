export type QuoteStatus = "new" | "contacted" | "in_progress" | "accepted" | "declined" | "completed";
export type ProjectStatus = "planning" | "in_progress" | "on_hold" | "completed" | "cancelled";
export type ExpenseCategory = "hosting" | "tools" | "marketing" | "salary" | "equipment" | "general" | "other";
export type IncomeSource = "project" | "freelance" | "subscription" | "other";
export type Currency = "EGP" | "USD" | "EUR";

export interface Quote {
  id: string;
  name: string;
  email: string;
  project_types: string[];
  budget: string | null;
  timeline: string | null;
  description: string | null;
  status: QuoteStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectLink {
  href: string;
  icon: string;
  label: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  client: string | null;
  description: string | null;
  status: ProjectStatus;
  budget: number | null;
  currency: Currency;
  paid: number;
  start_date: string | null;
  end_date: string | null;
  quote_id: string | null;
  tags: string[];
  features: string[];
  tech: string[];
  links: ProjectLink[];
  cover_image: string | null;
  published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: Currency;
  category: ExpenseCategory;
  date: string;
  project_id: string | null;
  notes: string | null;
  recurring: boolean;
  created_at: string;
}

export interface Income {
  id: string;
  title: string;
  amount: number;
  currency: Currency;
  source: IncomeSource;
  date: string;
  project_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      quotes: { Row: Quote; Insert: Omit<Quote, "id" | "created_at" | "updated_at" | "status">; Update: Partial<Quote> };
      projects: { Row: Project; Insert: Omit<Project, "id" | "created_at" | "updated_at">; Update: Partial<Project> };
      expenses: { Row: Expense; Insert: Omit<Expense, "id" | "created_at">; Update: Partial<Expense> };
      income: { Row: Income; Insert: Omit<Income, "id" | "created_at">; Update: Partial<Income> };
    };
  };
}
