import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, DollarSign, Clock, Eye } from 'lucide-react';
import { Settlement } from '@/types/contract';

interface SettlementListModalProps {
  title: string;
  settlements: Settlement[];
  onClose: () => void;
  onSelectSettlement: (settlement: Settlement) => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: '승인 대기', className: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' },
  PROCESSING: { label: '처리 중', className: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
  APPROVED: { label: '승인 완료', className: 'bg-green-500/20 text-green-300 border border-green-500/30' },
  PAID: { label: '지급 완료', className: 'bg-purple-500/20 text-purple-300 border border-purple-500/30' },
  REJECTED: { label: '반려', className: 'bg-red-500/20 text-red-300 border border-red-500/30' },
};

export function SettlementListModal({
  title,
  settlements,
  onClose,
  onSelectSettlement,
}: SettlementListModalProps) {
  const totalNet = settlements.reduce((sum, s) => sum + s.netAmount, 0);

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border-b border-white/10 p-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <div className="text-sm text-white/60">
                  {settlements.length}건 · 합계 {totalNet.toLocaleString()}원
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </motion.button>
          </div>

          {/* Settlement List */}
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-88px)] space-y-4">
            {settlements.length === 0 ? (
              <div className="text-center py-16 text-white/60">
                <DollarSign className="w-12 h-12 mx-auto mb-3 text-white/30" />
                <p>해당하는 정산 내역이 없습니다</p>
              </div>
            ) : (
              settlements.map((settlement, index) => {
                const status = statusConfig[settlement.status] || statusConfig.PENDING;
                return (
                  <motion.div
                    key={settlement.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {settlement.projectName}
                        </h3>
                        <div className="text-sm text-white/60">{settlement.employerName}</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.className}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Amount breakdown */}
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <div className="text-xs text-white/50 mb-0.5">총액</div>
                        <div className="text-sm font-medium text-white">
                          {settlement.totalAmount.toLocaleString()}원
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-white/50 mb-0.5">수수료+세금</div>
                        <div className="text-sm font-medium text-red-400">
                          -{(settlement.platformFee + settlement.tax).toLocaleString()}원
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-white/50 mb-0.5">실수령액</div>
                        <div className="text-sm font-bold text-green-400">
                          {settlement.netAmount.toLocaleString()}원
                        </div>
                      </div>
                    </div>

                    {/* Date + detail button */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sm text-white/60">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(settlement.requestDate).toLocaleDateString('ko-KR')}
                        {settlement.paidDate && (
                          <span> → {new Date(settlement.paidDate).toLocaleDateString('ko-KR')}</span>
                        )}
                      </div>
                      <motion.button
                        onClick={() => onSelectSettlement(settlement)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-1.5 bg-white/10 border border-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        상세보기
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
