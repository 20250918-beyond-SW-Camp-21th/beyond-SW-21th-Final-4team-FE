import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Briefcase,
  User,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  Eye,
} from 'lucide-react';
import { ContractDocument } from '@/types/contract';

interface ContractListModalProps {
  title: string;
  contracts: ContractDocument[];
  onClose: () => void;
  onSelectContract: (contract: ContractDocument) => void;
  isFreelancer: boolean;
}

const statusLabels: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: 'Active', className: 'bg-green-500/20 text-green-300 border border-green-500/30' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
  COMPLETED: { label: 'Completed', className: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
  TERMINATED: { label: 'Terminated', className: 'bg-red-500/20 text-red-300 border border-red-500/30' },
  DRAFT: { label: 'Draft', className: 'bg-gray-500/20 text-gray-300 border border-gray-500/30' },
};

function calculateProgress(contract: ContractDocument) {
  if (contract.milestones.length === 0) return 0;
  const completed = contract.milestones.filter((m) => m.status === 'COMPLETED').length;
  return Math.round((completed / contract.milestones.length) * 100);
}

export function ContractListModal({
  title,
  contracts,
  onClose,
  onSelectContract,
  isFreelancer,
}: ContractListModalProps) {
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
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <div className="text-sm text-white/60">{contracts.length}건</div>
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

          {/* Contract List */}
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-88px)] space-y-4">
            {contracts.length === 0 ? (
              <div className="text-center py-16 text-white/60">
                <Briefcase className="w-12 h-12 mx-auto mb-3 text-white/30" />
                <p>해당하는 계약이 없습니다</p>
              </div>
            ) : (
              contracts.map((contract, index) => {
                const status = statusLabels[contract.status] || statusLabels.DRAFT;
                const progress = calculateProgress(contract);
                const completedMilestones = contract.milestones.filter(
                  (m) => m.status === 'COMPLETED'
                ).length;

                return (
                  <motion.div
                    key={contract.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {contract.projectName}
                        </h3>
                        <div className="text-sm text-white/60 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          {isFreelancer ? contract.employerName : contract.freelancerName}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="text-white/60 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          마일스톤 {completedMilestones}/{contract.milestones.length}
                        </span>
                        <span className="font-semibold text-white">{progress}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer info */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5 text-white/60">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(contract.startDate).toLocaleDateString('ko-KR')} ~{' '}
                        {new Date(contract.endDate).toLocaleDateString('ko-KR')}
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold text-white">
                        <DollarSign className="w-3.5 h-3.5 text-green-400" />
                        {contract.budget.toLocaleString()}원
                      </div>
                    </div>

                    {/* Detail button */}
                    <motion.button
                      onClick={() => onSelectContract(contract)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="mt-4 w-full py-2.5 bg-white/10 border border-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      상세보기
                    </motion.button>
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
