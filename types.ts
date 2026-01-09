
export enum UserPersona {
  JEE_NEET = 'JEE_NEET',
  COLLEGE = 'COLLEGE'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface StudyPlan {
  subject: string;
  topics: {
    name: string;
    priority: 'High' | 'Medium' | 'Low';
    estimatedHours: number;
  }[];
}
