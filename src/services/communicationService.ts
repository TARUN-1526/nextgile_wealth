import {
  MessageThread,
  Meeting,
  ActionItem,
  UserProfile,
} from '../types';
import {
  MOCK_MESSAGES,
  MOCK_MEETINGS,
  MOCK_ACTION_ITEMS,
} from '../data/mockData';
import { auditService } from './auditService';

class CommunicationService {
  private threads: MessageThread[] = [...MOCK_MESSAGES];
  private meetings: Meeting[] = [...MOCK_MEETINGS];
  private actionItems: ActionItem[] = [...MOCK_ACTION_ITEMS];
  private listeners: (() => void)[] = [];

  public subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // --- Messages ---
  public getMessageThreads(userId?: string): MessageThread[] {
    return [...this.threads];
  }

  public sendMessage(
    threadId: string,
    text: string,
    sender: UserProfile
  ): MessageThread | undefined {
    const thread = this.threads.find((t) => t.id === threadId);
    if (!thread) return undefined;

    const newMsg = {
      id: `msg_${Date.now()}`,
      senderId: sender.id,
      senderName: sender.name,
      senderRole: sender.title || sender.role,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      text,
    };

    const updatedThread: MessageThread = {
      ...thread,
      lastMessageAt: 'Just now',
      unread: false,
      messages: [...thread.messages, newMsg],
    };

    this.threads = this.threads.map((t) => (t.id === threadId ? updatedThread : t));
    this.notify();
    return updatedThread;
  }

  public createThread(params: {
    subject: string;
    participants: { id: string; name: string }[];
    initialMessage: string;
    user: UserProfile;
  }): MessageThread {
    const newThread: MessageThread = {
      id: `thread_${Date.now()}`,
      subject: params.subject,
      participantIds: [params.user.id, ...params.participants.map((p) => p.id)],
      participantNames: [params.user.name, ...params.participants.map((p) => p.name)],
      lastMessageAt: 'Just now',
      unread: false,
      messages: [
        {
          id: `msg_${Date.now()}`,
          senderId: params.user.id,
          senderName: params.user.name,
          senderRole: params.user.title || params.user.role,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          text: params.initialMessage,
        },
      ],
    };

    this.threads = [newThread, ...this.threads];
    this.notify();
    return newThread;
  }

  // --- Meetings ---
  public getMeetings(): Meeting[] {
    return [...this.meetings];
  }

  public scheduleMeeting(meeting: Omit<Meeting, 'id'>, user: UserProfile): Meeting {
    const newMeeting: Meeting = {
      ...meeting,
      id: `meet_${Date.now()}`,
    };

    this.meetings = [newMeeting, ...this.meetings];

    auditService.recordEvent({
      userName: user.name,
      userRole: user.title || user.role,
      action: 'Client Fiduciary Review Scheduled',
      objectAffected: `Meeting: ${newMeeting.title} (${newMeeting.date})`,
      previousValue: 'None',
      newValue: `Scheduled: ${newMeeting.date} at ${newMeeting.time}`,
      reason: `Client service agenda: ${newMeeting.agenda}`,
    });

    this.notify();
    return newMeeting;
  }

  public cancelMeeting(id: string, user: UserProfile): void {
    const meeting = this.meetings.find((m) => m.id === id);
    if (!meeting) return;

    this.meetings = this.meetings.map((m) =>
      m.id === id ? { ...m, status: 'Pending Confirmation' as const } : m
    );

    auditService.recordEvent({
      userName: user.name,
      userRole: user.title || user.role,
      action: 'Meeting Status Updated',
      objectAffected: `Meeting: ${meeting.title}`,
      previousValue: meeting.status,
      newValue: 'Pending Confirmation',
      reason: 'Requested reschedule/cancellation.',
    });

    this.notify();
  }

  // --- Action Items ---
  public getActionItems(): ActionItem[] {
    return [...this.actionItems];
  }

  public createActionItem(item: Omit<ActionItem, 'id' | 'completed'>, user: UserProfile): ActionItem {
    const newItem: ActionItem = {
      ...item,
      id: `act_${Date.now()}`,
      completed: false,
    };

    this.actionItems = [newItem, ...this.actionItems];

    auditService.recordEvent({
      userName: user.name,
      userRole: user.title || user.role,
      action: 'Client Service Action Item Created',
      objectAffected: `Task: ${newItem.title}`,
      previousValue: 'None',
      newValue: `Open [${newItem.priority} Priority] Assigned: ${newItem.assignedTo}`,
      reason: `Due ${newItem.dueDate} for ${newItem.relatedEntity}.`,
    });

    this.notify();
    return newItem;
  }

  public toggleActionItem(id: string, user: UserProfile): void {
    const item = this.actionItems.find((a) => a.id === id);
    if (!item) return;

    const newCompleted = !item.completed;
    this.actionItems = this.actionItems.map((a) =>
      a.id === id ? { ...a, completed: newCompleted } : a
    );

    auditService.recordEvent({
      userName: user.name,
      userRole: user.title || user.role,
      action: newCompleted ? 'Action Item Completed' : 'Action Item Reopened',
      objectAffected: `Task: ${item.title}`,
      previousValue: item.completed ? 'Completed' : 'Pending',
      newValue: newCompleted ? 'Completed' : 'Pending',
      reason: `User updated action item status.`,
    });

    this.notify();
  }
}

export const communicationService = new CommunicationService();
