import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, DollarSign, Info } from 'lucide-react';

interface SettlementRequestModalProps {
  onClose: () => void;
}

export function SettlementRequestModal({ onClose }: SettlementRequestModalProps) {
  const [amount, setAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');

  const numAmount = parseInt(amount) || 0;
  const feeRate = 5; // 5% 고정 수수료
  const platformFee = Math.floor(numAmount * (feeRate / 100));
  const tax = Math.floor(numAmount * 0.1); // 10% 세금
  const netAmount = numAmount - platformFee - tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('정산 요청이 완료되었습니다!');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-3xl max-w-2xl w-full shadow-2xl"
        >
          <div className="border-b border-white/10 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">정산 요청</h2>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* 요청 금액 */}
            <div className="mb-6">
              <label className="block text-sm text-white/80 mb-2">
                정산 요청 금액 <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1000000"
                  min="0"
                  step="10000"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border-2 border-white/10 rounded-2xl focus:outline-none focus:border-blue-500 text-2xl font-medium text-white placeholder:text-white/30"
                  required
                />
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/60" />
              </div>
            </div>

            {/* 수수료 및 세금 breakdown */}
            {numAmount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-start gap-2 mb-4">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-white/60">
                    정산 금액에서 플랫폼 수수료와 세금이 차감됩니다
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">요청 금액</span>
                    <span className="text-xl font-medium text-white">
                      {numAmount.toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-red-400">
                    <span>플랫폼 수수료 ({feeRate}%)</span>
                    <span>- {platformFee.toLocaleString()}원</span>
                  </div>
                  <div className="flex items-center justify-between text-red-400">
                    <span>세금 (10%)</span>
                    <span>- {tax.toLocaleString()}원</span>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="font-medium text-white">실수령액</span>
                    <span className="text-2xl font-bold text-green-400">
                      {netAmount.toLocaleString()}원
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 계좌 정보 */}
            <div className="mb-6">
              <label className="block text-sm text-white/80 mb-2">
                입금 계좌 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="예: 국민은행 123-456-789012"
                className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-2xl focus:outline-none focus:border-blue-500 text-white placeholder:text-white/30"
                required
              />
            </div>

            {/* 처리 기간 안내 */}
            <div className="mb-6 bg-blue-500/20 border border-blue-400/30 rounded-2xl p-4">
              <div className="text-sm text-blue-200">
                <div className="font-medium mb-1">⏱️ 예상 처리 기간</div>
                <div>영업일 기준 3-5일 이내</div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-colors"
              >
                취소
              </motion.button>
              <motion.button
                type="submit"
                disabled={!amount || !bankAccount}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                정산 요청
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
