import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import type { Application, JobPosting, JobStatus } from '@/types';
import {
    addFavoriteJobPosting,
    createEmployerJobPosting,
    deleteEmployerJobPosting,
    getEmployerJobPostings,
    removeFavoriteJobPosting,
    searchFreelancerJobPostings,
    updateEmployerJobPosting,
    type EmployerJobPostingResponse,
    type FreelancerJobPostingResponse,
    type RecruitmentJobStatus
} from '@/api/jobApi';

type JobPostingInput = Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt'>;

type FetchJobPostingsOptions = {
    keyword?: string;
    favoriteOnly?: boolean;
};

const mapRecruitmentStatusToJobStatus = (status: RecruitmentJobStatus): JobStatus => {
    if (status === 'COMPLETED') {
        return 'CONTRACTED';
    }

    return status;
};

const mapJobStatusToRecruitmentStatus = (status: JobStatus): RecruitmentJobStatus => {
    if (status === 'CONTRACTED') {
        return 'COMPLETED';
    }

    return status;
};

const toNumericJobPostingId = (jobId: string): number => {
    const parsed = Number.parseInt(jobId, 10);
    if (Number.isNaN(parsed)) {
        throw new Error('유효하지 않은 공고 ID입니다.');
    }
    return parsed;
};

const mapEmployerJobPosting = (
    posting: EmployerJobPostingResponse,
    employerId: string
): JobPosting => {
    const now = new Date();

    return {
        id: String(posting.jobPostingId),
        employerId,
        employerName: posting.employerName,
        title: posting.title,
        description: posting.description,
        techStack: posting.techStack,
        budget: posting.budget,
        duration: posting.duration,
        status: mapRecruitmentStatusToJobStatus(posting.status),
        createdAt: now,
        updatedAt: now,
        headcount: posting.headcount,
        matchedHeadcount: posting.matchedHeadcount,
        favorite: false
    };
};

const mapFreelancerJobPosting = (posting: FreelancerJobPostingResponse): JobPosting => {
    const now = new Date();

    return {
        id: String(posting.jobPostingId),
        employerId: `employer-${posting.jobPostingId}`,
        employerName: posting.employerName,
        title: posting.title,
        description: posting.description,
        techStack: posting.techStack,
        budget: posting.budget,
        duration: posting.duration,
        status: 'OPEN',
        createdAt: now,
        updatedAt: now,
        headcount: posting.headcount,
        matchedHeadcount: posting.matchedHeadcount,
        favorite: posting.favorite
    };
};

const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return '요청 처리 중 오류가 발생했습니다.';
};

export const useJobStore = defineStore('job', () => {
    const authStore = useAuthStore();

    const jobPostings = ref<JobPosting[]>([]);
    const isLoading = ref(false);
    const errorMessage = ref<string | null>(null);

    // Applications are still local until backend endpoints are available.
    const applications = ref<Application[]>([]);

    const myJobs = computed(() => {
        if (!authStore.user || authStore.user.role !== 'EMPLOYER') {
            return [];
        }

        const currentEmployerId = String(authStore.user.id);
        return jobPostings.value.filter((job) => String(job.employerId) === currentEmployerId);
    });

    const getJobById = (id: string) => jobPostings.value.find((job) => job.id === id);

    const isFavorite = (id: string): boolean => {
        const target = getJobById(id);
        return Boolean(target?.favorite);
    };

    async function fetchJobPostings(options: FetchJobPostingsOptions = {}): Promise<void> {
        if (!authStore.user) {
            jobPostings.value = [];
            return;
        }

        isLoading.value = true;
        errorMessage.value = null;

        try {
            if (authStore.user.role === 'EMPLOYER') {
                const postings = await getEmployerJobPostings({ page: 0, size: 100 });
                jobPostings.value = postings.map((posting) =>
                    mapEmployerJobPosting(posting, String(authStore.user?.id ?? ''))
                );
                return;
            }

            const postings = await searchFreelancerJobPostings({
                page: 0,
                size: 100,
                keyword: options.keyword?.trim() || undefined,
                liked: options.favoriteOnly ?? false
            });
            jobPostings.value = postings.map(mapFreelancerJobPosting);
        } catch (error) {
            errorMessage.value = getErrorMessage(error);
            throw error;
        } finally {
            isLoading.value = false;
        }
    }

    async function addJobPosting(job: JobPostingInput): Promise<void> {
        if (!authStore.user || authStore.user.role !== 'EMPLOYER') {
            throw new Error('고용주만 공고를 등록할 수 있습니다.');
        }

        await createEmployerJobPosting({
            title: job.title,
            description: job.description,
            techStack: job.techStack,
            budget: job.budget,
            duration: job.duration,
            headcount: job.headcount && job.headcount > 0 ? job.headcount : 1
        });

        await fetchJobPostings();
    }

    async function updateJobPosting(id: string, updates: Partial<JobPosting>): Promise<void> {
        if (!authStore.user || authStore.user.role !== 'EMPLOYER') {
            throw new Error('고용주만 공고를 수정할 수 있습니다.');
        }

        const current = getJobById(id);

        await updateEmployerJobPosting(toNumericJobPostingId(id), {
            title: updates.title,
            description: updates.description,
            techStack: updates.techStack,
            budget: updates.budget,
            duration: updates.duration,
            headcount: updates.headcount ?? current?.headcount,
            status: updates.status ? mapJobStatusToRecruitmentStatus(updates.status) : undefined
        });

        await fetchJobPostings();
    }

    async function deleteJobPosting(id: string): Promise<void> {
        if (!authStore.user || authStore.user.role !== 'EMPLOYER') {
            throw new Error('고용주만 공고를 삭제할 수 있습니다.');
        }

        await deleteEmployerJobPosting(toNumericJobPostingId(id));
        jobPostings.value = jobPostings.value.filter((job) => job.id !== id);
    }

    async function toggleFavorite(id: string): Promise<void> {
        if (!authStore.user || authStore.user.role !== 'FREELANCER') {
            return;
        }

        const index = jobPostings.value.findIndex((job) => job.id === id);
        if (index === -1) {
            return;
        }

        const numericJobId = toNumericJobPostingId(id);
        const currentlyFavorite = Boolean(jobPostings.value[index].favorite);

        if (currentlyFavorite) {
            await removeFavoriteJobPosting(numericJobId);
        } else {
            await addFavoriteJobPosting(numericJobId);
        }

        jobPostings.value[index] = {
            ...jobPostings.value[index],
            favorite: !currentlyFavorite
        };
    }

    function getApplicationsByJob(jobId: string) {
        return applications.value.filter((app) => app.jobId === jobId);
    }

    function addApplication(app: Omit<Application, 'id' | 'createdAt'>) {
        const newApp: Application = {
            ...app,
            id: `app-${Date.now()}`,
            createdAt: new Date()
        };
        applications.value.push(newApp);
    }

    function updateApplicationStatus(
        id: string,
        status: Application['status'],
        rejectionReason?: string
    ): string | null {
        const index = applications.value.findIndex((app) => app.id === id);
        if (index === -1) return null;

        applications.value[index] = {
            ...applications.value[index],
            status,
            rejectionReason
        };

        if (status === 'ACCEPTED') {
            const chatStore = useChatStore();
            const app = applications.value[index];
            const job = getJobById(app.jobId);

            if (job) {
                const employerId = String(job.employerId);
                const freelancerId = String(app.freelancerId);

                const roomId = chatStore.createRoom(
                    [employerId, freelancerId],
                    {
                        [employerId]: job.employerName || 'Employer',
                        [freelancerId]: app.freelancerName || 'Freelancer'
                    },
                    {
                        relatedJobId: job.id,
                        relatedApplicationId: app.id
                    }
                );

                chatStore.selectRoom(roomId);
                return roomId;
            }
        }

        return null;
    }

    return {
        jobPostings,
        myJobs,
        applications,
        isLoading,
        errorMessage,
        getJobById,
        fetchJobPostings,
        addJobPosting,
        updateJobPosting,
        deleteJobPosting,
        isFavorite,
        toggleFavorite,
        getApplicationsByJob,
        addApplication,
        updateApplicationStatus
    };
});