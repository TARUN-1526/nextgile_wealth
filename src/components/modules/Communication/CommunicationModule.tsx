import React, { useState, useEffect } from 'react';
import { MessageThread, Meeting, ActionItem, UserProfile } from '../../../types';
import { communicationService } from '../../../services/communicationService';
import { PrototypeBadge } from '../../common/PrototypeBadge';
import {
  MessageSquare,
  Calendar,
  CheckSquare,
  Send,
  Paperclip,
  Clock,
  User,
  Plus,
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  CheckCircle2,
  FileText,
  Search,
  Share2,
} from 'lucide-react';

interface CommunicationModuleProps {
  currentUser: UserProfile;
}

export const CommunicationModule: React.FC<CommunicationModuleProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'messages' | 'meetings' | 'action_items'>('messages');

  // Subscribed state from communicationService
  const [threads, setThreads] = useState<MessageThread[]>(communicationService.getMessageThreads());
  const [selectedThread, setSelectedThread] = useState<MessageThread>(threads[0]);
  const [meetings, setMeetings] = useState<Meeting[]>(communicationService.getMeetings());
  const [actionItems, setActionItems] = useState<ActionItem[]>(communicationService.getActionItems());

  const [newMessageText, setNewMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Modals state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeRecipient, setComposeRecipient] = useState('Sarah Jenkins, CFP');
  const [composeBody, setComposeBody] = useState('');

  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetTitle, setMeetTitle] = useState('');
  const [meetClient, setMeetClient] = useState('Vance Family Household');
  const [meetDate, setMeetDate] = useState('2026-09-28');
  const [meetTime, setMeetTime] = useState('11:00 AM EST');
  const [meetAgenda, setMeetAgenda] = useState('');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDue, setTaskDue] = useState('2026-09-30');
  const [taskEntity, setTaskEntity] = useState('Vance Family Trust');
  const [taskPriority, setTaskPriority] = useState<ActionItem['priority']>('High');

  // Video Conference Modal state (no window.alert!)
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isVideoCameraOff, setIsVideoCameraOff] = useState(false);

  useEffect(() => {
    const unsub = communicationService.subscribe(() => {
      const latestThreads = communicationService.getMessageThreads();
      setThreads(latestThreads);
      setMeetings(communicationService.getMeetings());
      setActionItems(communicationService.getActionItems());
      if (selectedThread) {
        const found = latestThreads.find((t) => t.id === selectedThread.id);
        if (found) setSelectedThread(found);
      }
    });
    return () => unsub();
  }, [selectedThread]);

  // Handlers
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedThread) return;

    const updated = communicationService.sendMessage(selectedThread.id, newMessageText, currentUser);
    if (updated) {
      setSelectedThread(updated);
      setNewMessageText('');
    }
  };

  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeSubject.trim() || !composeBody.trim()) return;

    const newT = communicationService.createThread({
      subject: composeSubject,
      participants: [{ id: 'user_target', name: composeRecipient }],
      initialMessage: composeBody,
      user: currentUser,
    });

    setIsComposeOpen(false);
    setComposeSubject('');
    setComposeBody('');
    setSelectedThread(newT);
    setStatusMessage('New encrypted thread initiated.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleScheduleMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetTitle.trim()) return;

    communicationService.scheduleMeeting(
      {
        title: meetTitle,
        advisorName: currentUser.name,
        clientOrSponsorName: meetClient,
        date: meetDate,
        time: meetTime,
        status: 'Scheduled',
        agenda: meetAgenda || 'Fiduciary strategy review',
      },
      currentUser
    );

    setIsMeetingModalOpen(false);
    setMeetTitle('');
    setMeetAgenda('');
    setStatusMessage('Review meeting scheduled and calendar invite generated.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    communicationService.createActionItem(
      {
        title: taskTitle,
        description: taskDesc,
        assignedTo: currentUser.name,
        assignedRole: currentUser.title || currentUser.role,
        dueDate: taskDue,
        priority: taskPriority,
        relatedEntity: taskEntity,
      },
      currentUser
    );

    setIsTaskModalOpen(false);
    setTaskTitle('');
    setTaskDesc('');
    setStatusMessage('Action item created and assigned.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const filteredThreads = threads.filter(
    (t) =>
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.participantNames.some((n) => n.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              Secure Communications & Client Service Hub
            </h1>
            <PrototypeBadge label="FINRA Rule 4511 Archival" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            End-to-end encrypted fiduciary messages, scheduled reviews, and shared client action items
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'messages'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
            Messages ({threads.length})
          </button>
          <button
            onClick={() => setActiveTab('meetings')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'meetings'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            Meetings ({meetings.length})
          </button>
          <button
            onClick={() => setActiveTab('action_items')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'action_items'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
            Action Items ({actionItems.length})
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {statusMessage}
        </div>
      )}

      {/* TAB 1: SECURE MESSAGING */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[560px]">
          {/* Thread List Sidebar */}
          <div className="border-r border-slate-200 bg-slate-50/50 flex flex-col">
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search channels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <button
                onClick={() => setIsComposeOpen(true)}
                className="p-1.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs"
                title="Compose New Message"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredThreads.map((t) => {
                const isSelected = selectedThread?.id === t.id;
                const lastMsg = t.messages[t.messages.length - 1];
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedThread(t)}
                    className={`p-3.5 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-white border-l-4 border-indigo-600 shadow-xs'
                        : 'hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate">{t.subject}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">{t.lastMessageAt}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {t.participantNames.join(', ')}
                    </p>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                      {lastMsg?.text || (lastMsg as any)?.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Conversation View */}
          <div className="md:col-span-2 flex flex-col bg-white">
            {selectedThread ? (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b border-slate-200 bg-slate-50/40 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{selectedThread.subject}</h3>
                    <p className="text-[11px] text-slate-500">
                      Participants: {selectedThread.participantNames.join(' • ')}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsVideoOpen(true)}
                    className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Start Video Review
                  </button>
                </div>

                {/* Messages Scroll View */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 max-h-[420px]">
                  {selectedThread.messages.map((m) => {
                    const isCurrentUser = m.senderName === currentUser.name;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-900">{m.senderName}</span>
                          <span className="text-[10px] text-slate-400">
                            {m.senderRole} • {m.timestamp || (m as any).sentAt}
                          </span>
                        </div>
                        <div
                          className={`max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                            isCurrentUser
                              ? 'bg-indigo-600 text-white rounded-br-xs'
                              : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                          }`}
                        >
                          {m.text || (m as any).body}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Message Input Box */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-slate-200 bg-slate-50/50 flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Type an encrypted fiduciary message..."
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="submit"
                    disabled={!newMessageText.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
                Select a message thread to view conversation.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SCHEDULED MEETINGS */}
      {activeTab === 'meetings' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Scheduled Fiduciary Reviews & Client Conferences
              </h3>
              <p className="text-xs text-slate-500">
                Synchronized review calendar with agenda tracking and meeting minute archival
              </p>
            </div>
            <button
              onClick={() => setIsMeetingModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Schedule Review Meeting
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meetings.map((m) => (
              <div key={m.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{m.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Client: {m.clientOrSponsorName} • Host: {m.advisorName}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {m.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{m.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{m.time}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Agenda:</span> {m.agenda}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setIsVideoOpen(true)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Join Conference Room
                  </button>
                  <span className="text-[10px] text-slate-400">FINRA Form 4511 Archive</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ACTION ITEMS */}
      {activeTab === 'action_items' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Shared Service Action Items & Deliverables
              </h3>
              <p className="text-xs text-slate-500">
                Client onboarding, document signatures, and fiduciary follow-up task tracking
              </p>
            </div>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              New Action Item
            </button>
          </div>

          <div className="space-y-3">
            {actionItems.map((task) => (
              <div
                key={task.id}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => communicationService.toggleActionItem(task.id, currentUser)}
                    className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div>
                    <span
                      className={`text-xs font-bold ${
                        task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {task.title}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Assigned to: {task.assignedTo} ({task.assignedRole}) • Target: {task.relatedEntity}
                    </p>
                    {task.description && (
                      <p className="text-xs text-slate-600 mt-1">{task.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span className="text-[11px] text-slate-500">Due: {task.dueDate}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      task.priority === 'High'
                        ? 'bg-rose-100 text-rose-800'
                        : task.priority === 'Medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMPOSE MESSAGE MODAL */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm">Compose Secure Client Channel</h4>
              <button onClick={() => setIsComposeOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateThread} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Recipient:</label>
                <input
                  type="text"
                  value={composeRecipient}
                  onChange={(e) => setComposeRecipient(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Subject:</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Portfolio Review & Tax Estimate"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Initial Message:</label>
                <textarea
                  rows={4}
                  placeholder="Type your message..."
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE MEETING MODAL */}
      {isMeetingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm">Schedule Review Meeting</h4>
              <button onClick={() => setIsMeetingModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleMeeting} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Meeting Title:</label>
                <input
                  type="text"
                  placeholder="e.g. Annual Estate & Tax Review"
                  value={meetTitle}
                  onChange={(e) => setMeetTitle(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Client / Household:</label>
                <input
                  type="text"
                  value={meetClient}
                  onChange={(e) => setMeetClient(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Date:</label>
                  <input
                    type="date"
                    value={meetDate}
                    onChange={(e) => setMeetDate(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Time:</label>
                  <input
                    type="text"
                    value={meetTime}
                    onChange={(e) => setMeetTime(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Agenda & Notes:</label>
                <textarea
                  rows={2}
                  placeholder="Items to review..."
                  value={meetAgenda}
                  onChange={(e) => setMeetAgenda(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMeetingModalOpen(false)}
                  className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Schedule Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm">Create Service Action Item</h4>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Task Title:</label>
                <input
                  type="text"
                  placeholder="e.g. Sign revocable trust amendment"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Due Date:</label>
                  <input
                    type="date"
                    value={taskDue}
                    onChange={(e) => setTaskDue(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Priority:</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Description:</label>
                <textarea
                  rows={2}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Create Action Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SIMULATED VIDEO CONFERENCE ROOM MODAL (NO window.alert) */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 max-w-2xl w-full p-6 text-white space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="font-bold text-sm">Encrypted Video Conference: {selectedThread?.subject || 'Client Review'}</h4>
              </div>
              <button
                onClick={() => setIsVideoOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Video Viewport */}
            <div className="aspect-video bg-slate-950 rounded-2xl border border-slate-800 relative flex items-center justify-center overflow-hidden">
              {isVideoCameraOff ? (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <VideoOff className="w-10 h-10" />
                  <span className="text-xs">Camera is Off</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-full bg-indigo-600/30 border-2 border-indigo-400 flex items-center justify-center text-xl font-bold text-indigo-300">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold text-slate-300">
                    {currentUser.name} ({currentUser.title || currentUser.role})
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    HD 1080p • 256-bit TLS Encrypted
                  </span>
                </div>
              )}

              {/* Floating Participant Overlay */}
              <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs border border-slate-700/60 p-2.5 rounded-xl text-[11px] text-slate-300">
                <span className="font-bold text-white block mb-1">Active Attendees (2):</span>
                <div>• {currentUser.name} (You)</div>
                <div>• Sarah Jenkins, CFP (Lead Advisor)</div>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsVideoMuted(!isVideoMuted)}
                className={`p-3 rounded-full transition-colors ${
                  isVideoMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
                title={isVideoMuted ? 'Unmute' : 'Mute'}
              >
                {isVideoMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsVideoCameraOff(!isVideoCameraOff)}
                className={`p-3 rounded-full transition-colors ${
                  isVideoCameraOff ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
                title={isVideoCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
              >
                {isVideoCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsVideoOpen(false)}
                className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg"
              >
                <PhoneOff className="w-4 h-4" />
                End Meeting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
