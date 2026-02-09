import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  FilePlus,
  Building2,
  User,
  FolderOpen,
  Calendar,
  DollarSign,
  CheckCircle,
  ArrowLeft,
  FileText,
  Send,
} from 'lucide-react';
import { useApp, mockFreelancers } from '@/stores/app-context';
import { ContractDocument } from '@/types/contract';
import { SignaturePadModal } from './signature-pad-modal';

type CreateContractState = 'form' | 'signing' | 'success';

interface CreateContractProps {
  onNavigate: (screen: string) => void;
}

export function CreateContract({ onNavigate }: CreateContractProps) {
  const { currentUser, addContract } = useApp();
  const [state, setState] = useState<CreateContractState>('form');

  // Form fields
  const [selectedFreelancerId, setSelectedFreelancerId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [contractDate, setContractDate] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [budget, setBudget] = useState('');

  // Created contract reference
  const [createdContract, setCreatedContract] = useState<ContractDocument | null>(null);

  if (!currentUser || currentUser.role !== 'EMPLOYER') return null;

  const freelancerOptions = mockFreelancers.filter((u) => u.role === 'FREELANCER');

  const isFormValid =
    selectedFreelancerId && projectName && contractDate && paymentDate && budget;

  const handleSubmit = () => {
    if (!isFormValid) return;
    setState('signing');
  };

  const handleSign = (signatureDataUrl: string) => {
    const selectedFreelancer = freelancerOptions.find((f) => f.id === selectedFreelancerId);
    if (!selectedFreelancer) return;

    const newContract: ContractDocument = {
      id: `contract-${Date.now()}`,
      contractId: `c${Date.now()}`,
      projectName,
      freelancerId: selectedFreelancer.id,
      freelancerName: selectedFreelancer.name,
      employerId: currentUser.id,
      employerName: currentUser.companyName || currentUser.name,
      startDate: new Date(contractDate),
      endDate: new Date(paymentDate),
      status: 'DRAFT',
      budget: Number(budget),
      milestones: [],
      terms: `프로젝트: ${projectName}\n계약일: ${contractDate}\n결제일: ${paymentDate}\n계약금액: ${Number(budget).toLocaleString()}원`,
      signedByEmployer: true,
      signedByFreelancer: false,
      employerSignature: signatureDataUrl,
      paymentDate: new Date(paymentDate),
    };

    addContract(newContract);
    setCreatedContract(newContract);
    setState('success');
  };

  const handleReset = () => {
    setSelectedFreelancerId('');
    setProjectName('');
    setContractDate('');
    setPaymentDate('');
    setBudget('');
    setCreatedContract(null);
    setState('form');
  };

  // State A — Form
  if (state === 'form') {
    return (
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-3">
            <FilePlus className="w-10 h-10 text-white" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
              계약서 작성
            </h1>
          </div>
          <p className="text-white/60">프리랜서와의 계약서를 작성하고 전자 서명을 진행하세요</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 space-y-6">
            {/* 기업명 (auto-filled) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                <Building2 className="w-4 h-4" />
                기업명
              </label>
              <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/40">
                {currentUser.companyName || currentUser.name}
              </div>
            </div>

            {/* 프리랜서 이름 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                <User className="w-4 h-4" />
                프리랜서 이름
              </label>
              <select
                value={selectedFreelancerId}
                onChange={(e) => setSelectedFreelancerId(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="" className="bg-gray-900">프리랜서를 선택하세요</option>
                {freelancerOptions.map((f) => (
                  <option key={f.id} value={f.id} className="bg-gray-900">
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 프로젝트명 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                <FolderOpen className="w-4 h-4" />
                프로젝트명
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="프로젝트명을 입력하세요"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-blue-500/50 focus:outline-none transition-colors"
              />
            </div>

            {/* 계약일 / 결제일 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                  <Calendar className="w-4 h-4" />
                  계약일
                </label>
                <input
                  type="date"
                  value={contractDate}
                  onChange={(e) => setContractDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:outline-none transition-colors [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                  <Calendar className="w-4 h-4" />
                  결제일
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:outline-none transition-colors [color-scheme:dark]"
                />
              </div>
            </div>

            {/* 계약금액 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                <DollarSign className="w-4 h-4" />
                계약금액 (원)
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="계약금액을 입력하세요"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-blue-500/50 focus:outline-none transition-colors"
              />
            </div>

            {/* Submit Button */}
            <motion.button
              onClick={handleSubmit}
              disabled={!isFormValid}
              className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-lg transition-all ${
                isFormValid
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-blue-500/25'
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
              }`}
              whileHover={isFormValid ? { scale: 1.02 } : {}}
              whileTap={isFormValid ? { scale: 0.98 } : {}}
            >
              <FilePlus className="w-5 h-5" />
              계약서 작성
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // State B — Signing
  if (state === 'signing') {
    return (
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-3">
            <FilePlus className="w-10 h-10 text-white" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
              계약서 작성
            </h1>
          </div>
          <p className="text-white/60">전자 서명을 진행하세요</p>
        </motion.div>

        <SignaturePadModal
          signerName={currentUser.companyName || currentUser.name}
          onSign={handleSign}
          onClose={() => setState('form')}
        />
      </div>
    );
  }

  // State C — Success
  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-white mb-3"
          >
            계약서가 생성되었습니다
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2 mb-8"
          >
            <div className="flex items-center justify-center gap-2 text-white/60">
              <Send className="w-4 h-4" />
              <span>프리랜서에게 서명 요청이 전송되었습니다</span>
            </div>
            {createdContract && (
              <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10 text-left space-y-2">
                <div className="flex items-center gap-2 text-white/80">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">{createdContract.projectName}</span>
                </div>
                <div className="text-sm text-white/50">
                  프리랜서: {createdContract.freelancerName}
                </div>
                <div className="text-sm text-white/50">
                  계약금액: {createdContract.budget.toLocaleString()}원
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <motion.button
              onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FilePlus className="w-4 h-4" />
              새 계약서 작성
            </motion.button>
            <motion.button
              onClick={() => onNavigate('contracts')}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-semibold shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft className="w-4 h-4" />
              계약서 목록
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
