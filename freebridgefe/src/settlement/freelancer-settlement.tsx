import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Award,
  AlertCircle,
  Plus,
  Download,
  Zap,
} from 'lucide-react';
import { useApp } from '@/stores/app-context';
import {
  mockSettlements,
  mockMonthlyIncome,
} from '@/data/mock-contract-data';
import { SettlementRequestModal } from './settlement-request-modal';
import { SettlementDetailModal } from './settlement-detail-modal';
import { SettlementListModal } from './settlement-list-modal';
import { Settlement } from '@/types/contract';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function FreelancerSettlement() {
  const { currentUser } = useApp();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [listModal, setListModal] = useState<{ title: string; settlements: Settlement[] } | null>(null);

  if (!currentUser) return null;

  const mySettlements = mockSettlements.filter((s) => s.freelancerId === currentUser.id);

  // 사용 가능 잔액 계산
  const availableBalance = mySettlements
    .filter((s) => s.status === 'APPROVED' || s.status === 'PROCESSING')
    .reduce((sum, s) => sum + s.netAmount, 0);

  // 대기 중 금액
  const pendingAmount = mySettlements
    .filter((s) => s.status === 'PENDING')
    .reduce((sum, s) => sum + s.netAmount, 0);

  // 지급 완료 금액
  const paidAmount = mySettlements
    .filter((s) => s.status === 'PAID')
    .reduce((sum, s) => sum + s.netAmount, 0);

  // 상태별 정산 건수
  const statusCounts = {
    PENDING: mySettlements.filter((s) => s.status === 'PENDING').length,
    PROCESSING: mySettlements.filter((s) => s.status === 'PROCESSING').length,
    APPROVED: mySettlements.filter((s) => s.status === 'APPROVED').length,
    PAID: mySettlements.filter((s) => s.status === 'PAID').length,
  };

  // 월별 수입 데이터 (차트용)
  const chartData = mockMonthlyIncome.map((m) => ({
    month: m.month.slice(5),
    수입: m.income / 10000,
  }));

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
            정산 관리
          </h1>
        </div>
        <p className="text-white/60">수입 내역과 정산을 관리하세요</p>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 backdrop-blur-xl rounded-3xl p-10 mb-8 shadow-2xl border border-white/10"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-7xl font-bold text-white mb-6"
            >
              {availableBalance.toLocaleString()}
              <span className="text-3xl ml-3">원</span>
            </motion.div>
            <motion.button
              onClick={() => setShowRequestModal(true)}
              className="px-8 py-4 bg-white/10 border border-white/10 hover:bg-white/20 text-white rounded-full transition-all font-bold flex items-center gap-2 text-lg"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
              정산 요청
            </motion.button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: '대기 중', amount: pendingAmount, icon: Clock, settlements: mySettlements.filter((s) => s.status === 'PENDING') },
              { label: '총 지급액', amount: paidAmount, icon: CheckCircle, settlements: mySettlements.filter((s) => s.status === 'PAID') },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setListModal({ title: item.label, settlements: item.settlements })}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {item.amount.toLocaleString()}원
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: '승인 대기', count: statusCounts.PENDING, icon: AlertCircle, statusKey: 'PENDING' as const },
          { label: '처리 중', count: statusCounts.PROCESSING, icon: Clock, statusKey: 'PROCESSING' as const },
          { label: '승인 완료', count: statusCounts.APPROVED, icon: CheckCircle, statusKey: 'APPROVED' as const },
          { label: '지급 완료', count: statusCounts.PAID, icon: TrendingUp, statusKey: 'PAID' as const },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              onClick={() => setListModal({ title: stat.label, settlements: mySettlements.filter((s) => s.status === stat.statusKey) })}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg cursor-pointer hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className="w-8 h-8 text-white" />
                <div className="text-4xl font-bold text-white">{stat.count}</div>
              </div>
              <div className="text-white/90 font-medium">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Income Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            월별 수입 추이
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#fff" strokeOpacity={0.6} />
                <YAxis stroke="#fff" strokeOpacity={0.6} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="수입"
                  stroke="#60a5fa"
                  strokeWidth={3}
                  dot={{ fill: '#fff', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            빠른 작업
          </h2>
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowRequestModal(true)}
              className="w-full p-5 bg-white/5 border border-white/10 text-white rounded-2xl font-semibold flex items-center justify-between hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-3">
                <Plus className="w-6 h-6" />
                <span className="text-lg">새 정산 요청</span>
              </div>
              <span className="text-2xl">→</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-5 bg-white/5 border border-white/10 text-white rounded-2xl font-semibold flex items-center justify-between hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-3">
                <Download className="w-6 h-6" />
                <span className="text-lg">정산 내역 다운로드</span>
              </div>
              <span className="text-2xl">→</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-5 bg-white/5 border border-white/10 text-white rounded-2xl font-semibold flex items-center justify-between hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6" />
                <span className="text-lg">세금 계산서 발행</span>
              </div>
              <span className="text-2xl">→</span>
            </motion.button>
          </div>

          {/* Info Card */}
          <div className="mt-6 bg-blue-500/20 border border-blue-400/30 rounded-2xl p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-200">
                <div className="font-medium mb-1">정산 처리 안내</div>
                정산 요청 후 승인까지 평균 3-5 영업일이 소요됩니다.
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Settlement History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-lg"
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-green-400" />
          정산 내역
        </h2>

        {mySettlements.length === 0 ? (
          <div className="text-center py-16 text-white/60">
            <DollarSign className="w-16 h-16 mx-auto mb-4 text-white/40" />
            <p>정산 내역이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mySettlements.map((settlement, index) => {
              const statusConfig: Record<string, { label: string; color: string }> = {
                PENDING: { label: '승인 대기', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
                PROCESSING: { label: '처리 중', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
                APPROVED: { label: '승인 완료', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
                PAID: { label: '지급 완료', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
                REJECTED: { label: '반려', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
              };

              const status = statusConfig[settlement.status];

              return (
                <motion.div
                  key={settlement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  onClick={() => setSelectedSettlement(settlement)}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{settlement.projectName}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="text-sm text-white/60">
                        요청일: {new Date(settlement.requestDate).toLocaleDateString('ko-KR')}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-white/60 mb-1">정산 금액</div>
                      <div className="text-2xl font-bold text-white">
                        {settlement.netAmount.toLocaleString()}원
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showRequestModal && (
          <SettlementRequestModal onClose={() => setShowRequestModal(false)} />
        )}
        {listModal && (
          <SettlementListModal
            title={listModal.title}
            settlements={listModal.settlements}
            onClose={() => setListModal(null)}
            onSelectSettlement={(settlement) => {
              setListModal(null);
              setSelectedSettlement(settlement);
            }}
          />
        )}
        {selectedSettlement && (
          <SettlementDetailModal
            settlement={selectedSettlement}
            onClose={() => setSelectedSettlement(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
