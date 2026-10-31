export interface NotifyList {
  sentAt: Date;
  items: {
    name: string;
    quantity: number | null;
    note: string | null;
    addedBy: string;
  }[];
}

export interface NotifyService {
  sendList(list: NotifyList): Promise<{ text: string }>;
}
