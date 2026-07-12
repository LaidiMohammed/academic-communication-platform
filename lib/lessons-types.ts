export type ResourceType = 'course' | 'exam' | 'td' | 'tp' | 'video' | 'drive' | 'pdf';

export interface LinkItem {
  label: string;
  url: string;
  type: ResourceType;
}

export interface LevelRes {
  level: string;
  title: string;
  links: LinkItem[];
}

export interface SubjectInfo {
  id: string;
  icon: string;
  color: string;
  name: string;
  ar: string;
}

export interface LevelInfo {
  id: string;
  label: string;
  labelAr: string;
}
