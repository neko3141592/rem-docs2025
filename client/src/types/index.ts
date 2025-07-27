export type TaskType = '問題集' | '単語帳';
export type StatusType = 'todo' | 'doing' | 'done';
export type PriorityType = '高' | '中' | '低';

export const DefaultTask: Task = {
    id: '',
    title: '',
    type: '問題集',
    startPage: undefined,
    endPage: undefined,
    startQuestion: undefined,
    endQuestion: undefined,
    subQuestions: undefined,
    vocabCount: undefined,
    priority: '中',
    progress: 0,
    dueDate: new Date(),
    notify: false,
    notifyTime: undefined,
    status: 'todo',
    tags: [],
    completedPages: 0,
    completedVocab: 0,
    completedQuestionsList: [],
};

export type Task = {
    id: string;
    title: string;
    type: TaskType;
    startPage?: number;
    endPage?: number;
    startQuestion?: number;
    endQuestion?: number;
    subQuestions?: number;
    vocabCount?: number;
    priority: PriorityType;
    progress: number;
    dueDate: Date;
    notify: boolean;
    notifyTime?: Date;
    status: StatusType;
    tags: string[];
    completedPages?: number;
    completedVocab?: number;
    completedQuestionsList: number[];
};