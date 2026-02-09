import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Calendar, DollarSign, CheckCircle, User } from 'lucide-react';
import { ContractDocument } from '@/types/contract';

interface ContractDetailModalProps {
  contract: ContractDocument;
  onClose: () => void;
}

export function ContractDetailModal({ contract, onClose }: ContractDetailModalProps) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          {/* 헤더 */}
          <div className="sticky top-0 bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border-b border-white/10 p-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">계약서 상세</h2>
                <div className="text-sm text-white/60">Contract ID: {contract.id}</div>
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

          <div className="p-6 space-y-6">
            {/* 프로젝트 정보 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">프로젝트 정보</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-white/60 mb-1">프로젝트명</div>
                  <div className="text-lg font-medium text-white">{contract.projectName}</div>
                </div>
                <div>
                  <div className="text-sm text-white/60 mb-1">계약 상태</div>
                  <div className="text-lg font-medium text-white">{contract.status}</div>
                </div>
                <div>
                  <div className="text-sm text-white/60 mb-1">프리랜서</div>
                  <div className="text-lg font-medium text-white flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {contract.freelancerName}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-white/60 mb-1">고용주</div>
                  <div className="text-lg font-medium text-white flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {contract.employerName}
                  </div>
                </div>
              </div>
            </div>

            {/* 계약 기간 및 금액 */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-bold text-white">계약 기간</h3>
                </div>
                <div className="text-sm text-white/60 mb-1">시작일</div>
                <div className="text-lg font-medium text-white mb-3">
                  {new Date(contract.startDate).toLocaleDateString('ko-KR')}
                </div>
                <div className="text-sm text-white/60 mb-1">종료일</div>
                <div className="text-lg font-medium text-white">
                  {new Date(contract.endDate).toLocaleDateString('ko-KR')}
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-bold text-white">계약 금액</h3>
                </div>
                <div className="text-sm text-white/60 mb-1">총 계약금</div>
                <div className="text-3xl font-bold text-green-400">
                  {contract.budget.toLocaleString()}원
                </div>
              </div>
            </div>

            {/* 마일스톤 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-4">마일스톤 상세</h3>
              <div className="space-y-4">
                {contract.milestones.map((milestone, index) => (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-l-4 border-blue-500 pl-4 bg-white/5 rounded-r-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-medium text-white">{milestone.name}</span>
                          {milestone.status === 'COMPLETED' && (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          )}
                        </div>
                        <p className="text-sm text-white/60 mb-2">{milestone.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-white/60">
                            마감일: {new Date(milestone.dueDate).toLocaleDateString('ko-KR')}
                          </div>
                          <div className="font-medium text-green-400">
                            {milestone.amount.toLocaleString()}원
                          </div>
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          milestone.status === 'COMPLETED'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : milestone.status === 'IN_PROGRESS'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                        }`}
                      >
                        {milestone.status === 'COMPLETED'
                          ? '완료'
                          : milestone.status === 'IN_PROGRESS'
                          ? '진행중'
                          : '대기'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 계약 조건 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-4">계약 조건</h3>
              <div className="text-sm text-white/70 whitespace-pre-line leading-relaxed">
                {contract.terms}
              </div>
            </div>

            {/* 서명 정보 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-4">서명 정보</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  {contract.signedByFreelancer ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-white/30" />
                  )}
                  <div>
                    <div className="text-sm text-white/60">프리랜서</div>
                    <div className="font-medium text-white">
                      {contract.signedByFreelancer ? '서명 완료' : '서명 대기'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {contract.signedByEmployer ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-white/30" />
                  )}
                  <div>
                    <div className="text-sm text-white/60">고용주</div>
                    <div className="font-medium text-white">
                      {contract.signedByEmployer ? '서명 완료' : '서명 대기'}
                    </div>
                  </div>
                </div>
              </div>
              {contract.signedDate && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="text-sm text-white/60">
                    서명일: {new Date(contract.signedDate).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              )}
            </div>

            {/* 닫기 버튼 */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full py-4 bg-white/10 border border-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl hover:shadow-xl transition-all"
            >
              닫기
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
