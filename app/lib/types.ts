export type SiteSettings = {
  heroTitle: string;
  heroSubtitle: string;
  workspaceBackground: string;
  loveBackground: string;
  futureBackground: string;
  homeBackground: string;
  anniversaryStart: string;
  anniversaryLabel: string;
};

export type WorkspaceItem = {
  id: number;
  category: string;
  title: string;
  body: string;
  itemDate: string;
  imageUrl: string;
  pinned: boolean;
  sortOrder: number;
};

export type Photo = {
  id: number;
  scope: string;
  title: string;
  caption: string;
  url: string;
  objectKey: string;
  sortOrder: number;
};

export type LoveEvent = {
  id: number;
  title: string;
  body: string;
  eventDate: string;
  sortOrder: number;
};

export type LoveWish = {
  id: number;
  title: string;
  note: string;
  completed: boolean;
  sortOrder: number;
};

export type QuarterGoal = {
  id: number;
  quarter: string;
  title: string;
  note: string;
  progress: number;
  status: string;
  sortOrder: number;
};

export type TravelPlan = {
  id: number;
  destination: string;
  timeRange: string;
  note: string;
  status: string;
  imageUrl: string;
  sortOrder: number;
};

export type SiteData = {
  settings: SiteSettings;
  workspaceItems: WorkspaceItem[];
  photos: Photo[];
  loveEvents: LoveEvent[];
  loveWishes: LoveWish[];
  quarterGoals: QuarterGoal[];
  travelPlans: TravelPlan[];
};
