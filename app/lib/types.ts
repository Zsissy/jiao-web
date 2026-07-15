export type SiteSettings = {
  homeBackground: string;
  profileImage: string;
  workspaceBackground: string;
  loveBackground: string;
  futureBackground: string;
  anniversaryStart: string;
  anniversaryLabel: string;
  apartStart: string;
  apartSticker: string;
  stickerWorkStretch: string;
  stickerReadingDog: string;
  stickerNapDog: string;
  stickerWorkBox: string;
};

export type ContentBlock = {
  key: string;
  value: string;
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
  imageUrl: string;
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
  contentBlocks: Record<string, string>;
  workspaceItems: WorkspaceItem[];
  photos: Photo[];
  loveEvents: LoveEvent[];
  loveWishes: LoveWish[];
  quarterGoals: QuarterGoal[];
  travelPlans: TravelPlan[];
};
