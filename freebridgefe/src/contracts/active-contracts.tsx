import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Eye,
  Sparkles,
  FilePlus,
  PenTool,
} from 'lucide-react';
import { useApp } from '@/stores/app-context';
import { ContractDocument } from '@/types/contract';
import { ContractDetailModal } from './contract-detail-modal';
import { ContractListModal } from './contract-list-modal';
import { SignaturePadModal } from './signature-pad-modal';

interface ActiveContractsProps {
  onNavigate?: (screen: string) => void;
}

export function ActiveContracts({ onNavigate }: ActiveContractsProps) {
  const { currentUser, contracts, updateContract } = useApp();
  const [selectedContract, setSelectedContract] = useState<ContractDocument | null>(null);
  const [listModal, setListModal] = useState<{ title: string; contracts: ContractDocument[] } | null>(null);
  const [signingContractId, setSigningContractId] = useState<string | null>(null);

  if (!currentUser) return null;

  const isFreelancer = currentUser.role === 'FREELANCER';
  const myContracts = contracts.filter((c) =>
    isFreelancer ? c.freelancerId === currentUser.id : c.employerId === currentUser.id
  );

  // DRAFT contracts awaiting freelancer signature
  const draftContracts = isFreelancer
    ? myContracts.filter((c) => c.status === 'DRAFT' && !c.signedByFreelancer)
    : [];

  const activeContracts = myContracts.filter(
    (c) => c.status === 'ACTIVE' || c.status === 'IN_PROGRESS'
  );

  const completedContracts = myContracts.filter((c) => c.status === 'COMPLETED');

  // D-day 계산
  const calculateDday = (endDate: Date) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 상태 설정
  const statusConfig: Record<string, { label: string; gradient: string; icon: typeof CheckCircle }> = {
    ACTIVE: {
      label: 'Active',
      gradient: 'from-green-500 to-emerald-500',
      icon: CheckCircle,
    },
    IN_PROGRESS: {
      label: 'In Progress',
      gradient: 'from-blue-500 to-cyan-500',
      icon: TrendingUp,
    },
    COMPLETED: {
      label: 'Completed',
      gradient: 'from-gray-500 to-gray-600',
      icon: CheckCircle,
    },
    DRAFT: {
      label: '서명 필요',
      gradient: 'from-orange-500 to-yellow-500',
      icon: PenTool,
    },
  };

  // 전체 진행률 계산
  const calculateProgress = (contract: ContractDocument) => {
    if (contract.milestones.length === 0) return 0;
    const completed = contract.milestones.filter((m) => m.status === 'COMPLETED').length;
    return Math.round((completed / contract.milestones.length) * 100);
  };

  const handleFreelancerSign = (signatureDataUrl: string) => {
    if (!signingContractId) return;
    updateContract(signingContractId, {
      signedByFreelancer: true,
      freelancerSignature: signatureDataUrl,
      status: 'IN_PROGRESS',
      signedDate: new Date(),
    });
    setSigningContractId(null);
  };

  const renderContractCard = (contract: ContractDocument, index: number) => {
    const config = statusConfig[contract.status] || statusConfig.DRAFT;
    const StatusIcon = config.icon;

    // For DRAFT contracts (freelancer pending sign view)
    if (contract.status === 'DRAFT') {
      return (
        <motion.div
          key={contract.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-orange-500/10 backdrop-blur-xl rounded-3xl border-2 border-orange-500/30 p-8 hover:border-orange-500/50 transition-all"
        >
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h2 className="text-2xl font-bold text-white">{contract.projectName}</h2>
                <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${config.gradient} text-white text-sm font-medium shadow-lg flex items-center gap-2`}>
                  <StatusIcon className="w-4 h-4" />
                  {config.label}
                </div>
              </div>
              <div className="text-white/60 flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" />
                발주자: {contract.employerName}
              </div>
              <div className="flex flex-wrap gap-4 text-white/50 text-sm mt-3">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {contract.budget.toLocaleString()}원
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(contract.startDate).toLocaleDateString('ko-KR')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => setSelectedContract(contract)}
                className="px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-medium flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Eye className="w-4 h-4" />
                상세보기
              </motion.button>
              <motion.button
                onClick={() => setSigningContractId(contract.id)}
                className="px-5 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl text-white font-semibold flex items-center gap-2 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PenTool className="w-4 h-4" />
                서명하기
              </motion.button>
            </div>
          </div>
        </motion.div>
      );
    }

    // Regular active/in-progress contract card
    const dday = calculateDday(contract.endDate);
    const progress = calculateProgress(contract);
    const isDanger = dday <= 7;
    const isWarning = dday > 7 && dday <= 30;

    return (
      <motion.div
        key={contract.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -4 }}
        className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 hover:border-white/20 transition-all"
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start justify-between mb-8 gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <h2 className="text-3xl font-bold text-white">{contract.projectName}</h2>
              <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${config.gradient} text-white text-sm font-medium shadow-lg flex items-center gap-2`}>
                <StatusIcon className="w-4 h-4" />
                {config.label}
              </div>
            </div>
            <div className="text-white/60 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {isFreelancer
                ? `발주자: ${contract.employerName}`
                : `담당자: ${contract.freelancerName}`}
            </div>
          </div>

          {/* D-day */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`text-center px-8 py-4 rounded-2xl ${
              isDanger
                ? 'bg-red-500/20 border-2 border-red-500/50'
                : isWarning
                ? 'bg-orange-500/20 border-2 border-orange-500/50'
                : 'bg-blue-500/20 border-2 border-blue-500/50'
            }`}
          >
            <div
              className={`text-xs mb-2 font-medium ${
                isDanger ? 'text-red-400' : isWarning ? 'text-orange-400' : 'text-blue-400'
              }`}
            >
              D-Day
            </div>
            <div
              className={`text-4xl font-bold ${
                isDanger ? 'text-red-400' : isWarning ? 'text-orange-400' : 'text-blue-400'
              }`}
            >
              {dday > 0 ? `-${dday}` : dday === 0 ? 'Today' : `+${Math.abs(dday)}`}
            </div>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/60 font-medium">전체 진행률</span>
            <span className="text-3xl font-bold text-white">{progress}%</span>
          </div>
          <div className="h-4 bg-white/10 rounded-full overflow-hidden backdrop-blur-xl">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-full shadow-lg"
            />
          </div>
        </div>

        {/* Milestones */}
        {contract.milestones.length > 0 && (
          <div className="mb-8">
            <div className="text-white/60 font-medium mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              마일스톤
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {contract.milestones.map((milestone, idx) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + idx * 0.1 }}
                  className={`p-5 rounded-2xl ${
                    milestone.status === 'COMPLETED'
                      ? 'bg-green-500/20 border-2 border-green-500/50'
                      : milestone.status === 'IN_PROGRESS'
                      ? 'bg-blue-500/20 border-2 border-blue-500/50'
                      : 'bg-white/5 border-2 border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {milestone.status === 'COMPLETED' ? (
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    ) : milestone.status === 'IN_PROGRESS' ? (
                      <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 animate-pulse" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-white/40 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">{milestone.name}</div>
                      <div className="text-sm text-white/60 mt-1">
                        {milestone.amount.toLocaleString()}원
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pt-8 border-t border-white/10 gap-4">
          <div className="flex flex-wrap gap-6 text-white/60">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {new Date(contract.startDate).toLocaleDateString('ko-KR')} ~{' '}
                {new Date(contract.endDate).toLocaleDateString('ko-KR')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-medium">총 {contract.budget.toLocaleString()}원</span>
            </div>
          </div>

          <motion.button
            onClick={() => setSelectedContract(contract)}
            className="px-6 py-3 bg-white text-black rounded-full font-semibold flex items-center gap-2 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Eye className="w-4 h-4" />
            상세보기
          </motion.button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center justify-between flex-wrap gap-4 mb-3">
          <div className="flex items-center gap-3">
            <FileText className="w-10 h-10 text-white" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
              Active Contracts
            </h1>
          </div>
          {!isFreelancer && onNavigate && (
            <motion.button
              onClick={() => onNavigate('createContract')}
              className="px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-semibold flex items-center gap-2 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FilePlus className="w-5 h-5" />
              계약서 작성
            </motion.button>
          )}
        </div>
        <p className="text-white/60">
          {isFreelancer ? '진행 중인 계약서를 관리하세요' : '프리랜서와의 계약을 확인하세요'}
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {[
          {
            icon: TrendingUp,
            label: '활성 계약',
            value: activeContracts.length,
            gradient: 'from-blue-500 to-cyan-500',
            onClick: () => setListModal({ title: '활성 계약', contracts: activeContracts }),
          },
          {
            icon: CheckCircle,
            label: '완료 계약',
            value: completedContracts.length,
            gradient: 'from-green-500 to-emerald-500',
            onClick: () => setListModal({ title: '완료 계약', contracts: completedContracts }),
          },
          {
            icon: DollarSign,
            label: '총 계약금',
            value: `${activeContracts.reduce((sum, c) => sum + c.budget, 0).toLocaleString()}원`,
            gradient: 'from-yellow-500 to-orange-500',
            isAmount: true,
            onClick: () => setListModal({ title: '총 계약금', contracts: myContracts }),
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              onClick={stat.onClick}
              className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 hover:border-white/20 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-sm text-white/60 mb-1">{stat.label}</div>
                  <div className={`font-bold text-white ${stat.isAmount ? 'text-2xl' : 'text-4xl'}`}>
                    {stat.value}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Draft Contracts Awaiting Freelancer Signature */}
      {draftContracts.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <PenTool className="w-5 h-5 text-orange-400" />
            <h2 className="text-xl font-bold text-white">서명 대기 중인 계약서</h2>
            <span className="ml-2 min-w-[24px] h-6 flex items-center justify-center px-2 bg-orange-500 text-white text-xs font-bold rounded-full">
              {draftContracts.length}
            </span>
          </div>
          <div className="space-y-4">
            {draftContracts.map((contract, index) => renderContractCard(contract, index))}
          </div>
        </div>
      )}

      {/* Active Contract List */}
      {activeContracts.length === 0 && draftContracts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-16 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6"
          >
            <FileText className="w-10 h-10 text-white/60" />
          </motion.div>
          <h3 className="text-2xl font-semibold mb-3 text-white">활성 계약이 없습니다</h3>
          <p className="text-white/60">새로운 프로젝트를 시작해보세요</p>
        </motion.div>
      ) : activeContracts.length > 0 ? (
        <div className="space-y-8">
          {draftContracts.length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white">진행 중인 계약서</h2>
            </div>
          )}
          <AnimatePresence>
            {activeContracts.map((contract, index) => renderContractCard(contract, index))}
          </AnimatePresence>
        </div>
      ) : null}

      {/* Freelancer Signature Modal */}
      {signingContractId && currentUser && (
        <SignaturePadModal
          signerName={currentUser.name}
          onSign={handleFreelancerSign}
          onClose={() => setSigningContractId(null)}
        />
      )}

      {/* 카테고리별 계약 목록 모달 */}
      {listModal && (
        <ContractListModal
          title={listModal.title}
          contracts={listModal.contracts}
          onClose={() => setListModal(null)}
          onSelectContract={(contract) => {
            setListModal(null);
            setSelectedContract(contract);
          }}
          isFreelancer={isFreelancer}
        />
      )}

      {/* 계약서 상세 모달 */}
      {selectedContract && (
        <ContractDetailModal
          contract={selectedContract}
          onClose={() => setSelectedContract(null)}
        />
      )}
    </div>
  );
}
