import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Check,
  Bell,
  Award,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  Sliders,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigate: (actionUrl: string) => void;
  onOpenCurriculumAdjustment?: (currentVel?: number, targetVel?: number) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onNavigate,
  onOpenCurriculumAdjustment,
}) => {
  if (!isOpen) return null;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'velocity_alert':
        return <AlertTriangle className="w-4 h-4 text-[#111111]" />;
      case 'verification':
        return <CheckCircle2 className="w-4 h-4 text-[#111111]" />;
      case 'assessment':
        return <Award className="w-4 h-4 text-[#111111]" />;
      case 'outcome':
        return <TrendingUp className="w-4 h-4 text-[#111111]" />;
      case 'learning':
        return <Sparkles className="w-4 h-4 text-[#111111]" />;
      case 'system':
      default:
        return <Bell className="w-4 h-4 text-[#111111]" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-end p-4 bg-[#111111]/30 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md h-[90vh] virt-glass-strong rounded-2xl border border-[#111111]/15 shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-[#111111]/12 bg-[#F1E9DD]/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#111111]">Notifications</span>
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white rounded-sm tabular-nums shadow-2xs">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onMarkAllRead}
                className="text-xs text-[#111111]/70 hover:text-[#111111] underline transition-colors"
              >
                Mark all read
              </button>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-[#DED0BD] text-[#111111]/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#111111]/50">
                No notifications logged.
              </div>
            ) : (
              notifications.map((item) => {
                const isVelocityAlert = item.type === 'velocity_alert';

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (!item.read) onMarkRead(item.id);
                      if (isVelocityAlert && onOpenCurriculumAdjustment) {
                        onOpenCurriculumAdjustment(
                          item.metadata?.currentVelocity ?? 1.0,
                          item.metadata?.thresholdVelocity ?? 1.5
                        );
                        onClose();
                      } else if (item.actionUrl) {
                        onNavigate(item.actionUrl);
                        onClose();
                      }
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isVelocityAlert && !item.read
                        ? 'bg-[#F5EEE4] border-[#111111] shadow-md ring-1 ring-[#111111]/15'
                        : item.read
                        ? 'bg-[#F1E9DD]/40 border-[#111111]/08 opacity-75 hover:opacity-100 hover:bg-[#F1E9DD]/80'
                        : 'bg-[#F5EEE4] border-[#111111]/20 shadow-sm hover:border-[#111111]/40'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`p-2 rounded-lg border ${
                          isVelocityAlert
                            ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white border-transparent shadow-xs'
                            : 'bg-[#E8DDCC] text-[#111111] border-[#111111]/10'
                        }`}
                      >
                        {getIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-[#111111] truncate">{item.title}</h4>
                          <span className="text-[10px] text-[#111111]/50 tabular-nums">
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-[#111111]/80 mt-1 leading-snug">{item.message}</p>

                        {/* Interactive Suggestion Actions for Velocity Alert */}
                        {isVelocityAlert && (
                          <div className="mt-2.5 pt-2 border-t border-[#111111]/10 space-y-1.5">
                            <span className="text-[10px] font-bold text-[#111111] block uppercase tracking-wider">
                              Suggested Interventions:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!item.read) onMarkRead(item.id);
                                  onOpenCurriculumAdjustment?.(
                                    item.metadata?.currentVelocity ?? 1.0,
                                    item.metadata?.thresholdVelocity ?? 1.5
                                  );
                                  onClose();
                                }}
                                className="px-2 py-1 rounded-lg bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white text-[10px] font-bold hover:opacity-95 flex items-center gap-1 shadow-xs"
                              >
                                <Sliders className="w-3 h-3" />
                                Adjust Curriculum
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!item.read) onMarkRead(item.id);
                                  onOpenCurriculumAdjustment?.(
                                    item.metadata?.currentVelocity ?? 1.0,
                                    item.metadata?.thresholdVelocity ?? 1.5
                                  );
                                  onClose();
                                }}
                                className="px-2 py-1 rounded-lg bg-[#E8DDCC] text-[#111111] text-[10px] font-bold hover:bg-[#DED0BD] border border-[#111111]/15 flex items-center gap-1"
                              >
                                <Calendar className="w-3 h-3" />
                                Mentor Check-In
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#111111]/06">
                          <span className="text-[10px] uppercase font-semibold text-[#111111]/50">
                            {item.type.replace('_', ' ')}
                          </span>
                          {!item.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onMarkRead(item.id);
                              }}
                              className="text-[10px] font-semibold text-[#111111] hover:underline flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-[#111111]/10 bg-[#E8DDCC]/70 text-[11px] text-[#111111]/60 text-center">
            Notifications persist with full audit trail compliance
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
