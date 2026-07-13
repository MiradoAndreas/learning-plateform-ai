export type RoadmapRecommendation = "recommended" | "alternative" | "none";

export type RoadmapOption = {
  id: string;
  label: string;
  recommendation: RoadmapRecommendation;
  note?: string;
};

export type RoadmapTopicEntry = {
  kind: "topic";
  id: string;
  label: string;
};

export type RoadmapChoiceEntry = {
  kind: "choice";
  id: string;
  label: string; // ex: "Choisissez votre spécialisation"
  options: RoadmapOption[];
};

export type RoadmapEntry = RoadmapTopicEntry | RoadmapChoiceEntry;

export type RoadmapCenterNode = {
  id: string;
  label: string;
};

export type RoadmapSection = {
  id: string;
  title: string;
  centerNodes: RoadmapCenterNode[];
  leftNodes: RoadmapEntry[];
  rightNodes: RoadmapEntry[];
};

export type RoadmapData = {
  title: string;
  sections: RoadmapSection[];
};
