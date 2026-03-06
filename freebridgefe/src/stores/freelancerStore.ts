import { defineStore } from "pinia";
import { ref } from "vue";
import { getFreelancerRecommendations } from "@/api/recommendationApi";
import type { User, Proposal } from "@/types";
import { useChatStore } from "@/stores/chatStore";

export const useFreelancerStore = defineStore("freelancer", () => {
  const freelancers = ref<(User & { matchScore?: number })[]>([]);
  const recommendedFetchError = ref<string | null>(null);
  const isFetchingRecommended = ref(false);

  async function fetchRecommendedFreelancers(jobId: number) {
    isFetchingRecommended.value = true;
    recommendedFetchError.value = null;

    try {
      const recommendations = await getFreelancerRecommendations(jobId);
      freelancers.value = recommendations.map((rec) => ({
        id: rec.id.toString(),
        role: "FREELANCER",
        name: rec.nameOrTitle,
        email: "hidden@example.com", // Hidden info for recommendation
        skills: rec.skills,
        experience: rec.experience,
        bio: `AI 추천 점수: ${(rec.matchScore * 100).toFixed(0)}% 일치하는 프리랜서입니다.`,
        matchScore: rec.matchScore,
      })) as (User & { matchScore?: number })[];
    } catch (error: any) {
      console.error("Failed to fetch recommended freelancers:", error);
      freelancers.value = [];
      recommendedFetchError.value =
        error.message || "프리랜서 추천 목록을 불러오는데 실패했습니다.";
    } finally {
      isFetchingRecommended.value = false;
    }
  }

  const proposals = ref<Proposal[]>([
    {
      id: "proposal-1",
      employerId: "e1",
      employerName: "스타트업 A",
      freelancerId: "f1",
      freelancerName: "김프론트",
      jobId: "job1",
      message:
        "대시보드 고도화 프로젝트에 합류해주실 수 있을까요? 기술 인터뷰 없이 바로 협의 가능합니다.",
      status: "PENDING",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
    },
    {
      id: "proposal-2",
      employerId: "e1",
      employerName: "스타트업 A",
      freelancerId: "f3",
      freelancerName: "박풀스택",
      jobId: "job2",
      message:
        "백엔드 안정화 작업 제안을 드립니다. 가능 일정 회신 부탁드립니다.",
      status: "ACCEPTED",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    },
  ]);

  function addProposal(proposal: Omit<Proposal, "id" | "createdAt">) {
    const newProposal: Proposal = {
      ...proposal,
      id: `p${Date.now()}`,
      createdAt: new Date(),
    };
    proposals.value = [newProposal, ...proposals.value];
  }

  function getProposalsByFreelancer(freelancerId: string) {
    return proposals.value.filter(
      (p: Proposal) => p.freelancerId === freelancerId,
    );
  }

  function updateProposalStatus(
    proposalId: string,
    status: Proposal["status"],
    rejectionReason?: string,
  ): string | boolean | null {
    const index = proposals.value.findIndex(
      (p: Proposal) => p.id === proposalId,
    );
    if (index === -1) return null;

    const proposal = proposals.value[index];

    // Update local state
    proposals.value[index] = {
      ...proposal,
      status,
      rejectionReason: status === "REJECTED" ? rejectionReason : undefined,
    };

    if (status === "ACCEPTED") {
      const chatStore = useChatStore();
      const employerId = proposals.value[index].employerId;
      const freelancerId = proposals.value[index].freelancerId;
      const jobId = proposals.value[index].jobId; // Capture possibly undefined jobId

      const context: any = {
        relatedProposalId: proposalId,
      };
      if (jobId) {
        context.relatedJobId = jobId;
      }

      const roomId = chatStore.createRoom(
        [employerId, freelancerId],
        {
          [employerId]: proposals.value[index].employerName || "Employer",
          [freelancerId]: proposals.value[index].freelancerName || "Freelancer",
        },
        context,
      );

      chatStore.selectRoom(roomId);
      return roomId;
    }

    return true;
  }

  return {
    freelancers,
    recommendedFetchError,
    isFetchingRecommended,
    fetchRecommendedFreelancers,
    proposals,
    addProposal,
    getProposalsByFreelancer,
    updateProposalStatus,
  };
});
