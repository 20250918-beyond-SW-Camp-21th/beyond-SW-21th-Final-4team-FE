import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { Settlement } from '@/types/contract';

interface SettlementDetailModalProps {
  settlement: Settlement;
  onClose: () => void;
}

// 결제 단계 타임라인
const paymentStages = [
  { id: 1, label: '정산 요청', status: 'PENDING' },
  { id: 2, label: '검토중', status: 'PROCESSING' },
  { id: 3, label: '승인 완료', status: 'APPROVED' },
  { id: 4, label: '지급 완료', status: 'PAID' },
];

export function SettlementDetailModal({ settlement, onClose }: SettlementDetailModalProps) {
  // 현재 단계 찾기
  const currentStageIndex = paymentStages.findIndex((s) => s.status === settlement.status);
  
  // 수수료율 계산 (역산)
  const feeRate = ((settlement.platformFee / settlement.totalAmount) * 100).toFixed(1);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          <div className="sticky top-0 bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border-b border-white/10 p-6 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-white">정산 상세 내역</h2>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </motion.button>
          </div>

          <div className="p-6 space-y-6">
            {/* 프로젝트 정보 */}
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-blue-400/30 rounded-2xl p-6 shadow-lg">
              <div className="text-sm text-white/60 mb-1">프로젝트</div>
              <div className="text-2xl font-medium text-white mb-2">{settlement.projectName}</div>
              <div className="text-white/70">{settlement.employerName}</div>
            </div>

            {/* 타임라인 스테퍼 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-6">정산 진행 상태</h3>
              <div className="relative">
                {/* 프로그레스 라인 */}
                <div className="absolute top-6 left-6 right-6 h-1 bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(currentStageIndex / (paymentStages.length - 1)) * 100}%`,
                    }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"
                  />
                </div>

                {/* 단계 */}
                <div className="relative flex justify-between">
                  {paymentStages.map((stage, index) => {
                    const isCompleted = index <= currentStageIndex;
                    const isCurrent = index === currentStageIndex;

                    return (
                      <div key={stage.id} className="flex flex-col items-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 + index * 0.1 }}
                          className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-gradient-to-br from-blue-500 to-green-500 border-white/20 shadow-lg'
                              : 'bg-gray-800 border-white/10'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6 text-white" />
                          ) : (
                            <div className="w-3 h-3 rounded-full bg-white/30" />
                          )}
                        </motion.div>
                        <div
                          className={`mt-3 text-sm text-center ${
                            isCurrent ? 'font-medium text-blue-400' : 'text-white/60'
                          }`}
                        >
                          {stage.label}
                        </div>
                        {isCurrent && (
                          <div className="mt-1 px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                            진행중
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 금액 breakdown */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                금액 상세
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="text-white/60">총 정산 금액</span>
                  <span className="text-2xl font-medium text-white">
                    {settlement.totalAmount.toLocaleString()}원
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-red-400">
                    <span>플랫폼 수수료 ({feeRate}%)</span>
                    <span>- {settlement.platformFee.toLocaleString()}원</span>
                  </div>
                  <div className="flex items-center justify-between text-red-400">
                    <span>원천세 (10%)</span>
                    <span>- {settlement.tax.toLocaleString()}원</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-lg font-medium text-white">실수령액</span>
                  <span className="text-3xl font-bold text-green-400">
                    {settlement.netAmount.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>

            {/* 계좌 정보 */}
            {settlement.bankAccount && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-3">입금 계좌</h3>
                <div className="text-xl font-medium text-white">{settlement.bankAccount}</div>
              </div>
            )}

            {/* 날짜 정보 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-white/60 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">요청일</span>
                </div>
                <div className="font-medium text-white">
                  {new Date(settlement.requestDate).toLocaleDateString('ko-KR')}
                </div>
              </div>

              {settlement.paidDate && (
                <div className="bg-green-500/20 border border-green-400/30 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-green-300 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">지급일</span>
                  </div>
                  <div className="font-medium text-green-200">
                    {new Date(settlement.paidDate).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              )}
            </div>

            {/* 상태별 안내 메시지 */}
            {settlement.status === 'PROCESSING' && (
              <div className="bg-blue-500/20 border border-blue-400/30 rounded-2xl p-4">
                <div className="text-sm text-blue-200">
                  💡 정산이 처리 중입니다. 영업일 기준 2-3일 내 승인 예정입니다.
                </div>
              </div>
            )}

            {settlement.status === 'APPROVED' && (
              <div className="bg-purple-500/20 border border-purple-400/30 rounded-2xl p-4">
                <div className="text-sm text-purple-200">
                  ✅ 정산이 승인되었습니다. 곧 입금 처리될 예정입니다.
                </div>
              </div>
            )}

            {settlement.status === 'PAID' && (
              <div className="bg-green-500/20 border border-green-400/30 rounded-2xl p-4">
                <div className="text-sm text-green-200">
                  🎉 정산이 완료되어 입금되었습니다. 계좌를 확인해주세요.
                </div>
              </div>
            )}

            {/* 닫기 버튼 */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-2xl hover:shadow-xl transition-all"
            >
              닫기
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
