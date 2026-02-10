import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import type { JobPosting, Application } from '@/types';

export const useJobStore = defineStore('job', () => {
    const authStore = useAuthStore();

    // Mock Data
    const jobPostings = ref<JobPosting[]>([
        {
            id: 'job1',
            employerId: 'e1',
            employerName: '스타트업 A',
            title: 'React 프론트엔드 개발자 구인',
            description: '핀테크 스타트업에서 React 프론트엔드 개발자를 모십니다. MSA 경험 우대합니다.',
            techStack: ['React', 'TypeScript', 'Redux', 'TailwindCSS'],
            budget: 5000000,
            duration: 3,
            status: 'OPEN',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'job2',
            employerId: 'e1',
            employerName: '스타트업 A',
            title: 'Node.js 백엔드 개발자 구인',
            description: '핀테크 스타트업에서 Node.js 백엔드 개발자를 모십니다.',
            techStack: ['Node.js', 'Express', 'MySQL'],
            budget: 6000000,
            duration: 3,
            status: 'CLOSED',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'job3',
            employerId: 'e2',
            employerName: '테크기업 B',
            title: 'Flutter 모바일 앱 개발',
            description: '크로스플랫폼 모바일 앱 개발 프로젝트입니다.',
            techStack: ['Flutter', 'Dart', 'Firebase'],
            budget: 8000000,
            duration: 4,
            status: 'OPEN',
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    ]);

    const applications = ref<Application[]>([
        {
            id: 'app1',
            jobId: 'job1',
            freelancerId: 'f1',
            freelancerName: '김프론트',
            message: '지원합니다.',
            status: 'PENDING',
            createdAt: new Date()
        },
        {
            id: 'app2',
            jobId: 'job1',
            freelancerId: 'f2',
            freelancerName: '이풀스택',
            message: '열심히 하겠습니다.',
            status: 'PENDING',
            createdAt: new Date()
        }
    ]);

    // Getters
    const myJobs = computed(() => {
        if (!authStore.user) return [];
        return jobPostings.value.filter(job => job.employerId === authStore.user!.id);
    });

    const getJobById = (id: string) => jobPostings.value.find(j => j.id === id);

    // Actions
    function addJobPosting(job: Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt'>) {
        const newJob: JobPosting = {
            ...job,
            id: `job-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        jobPostings.value.unshift(newJob);
    }

    function updateJobPosting(id: string, updates: Partial<JobPosting>) {
        const index = jobPostings.value.findIndex(job => job.id === id);
        if (index !== -1) {
            jobPostings.value[index] = { ...jobPostings.value[index], ...updates, updatedAt: new Date() };
        }
    }

    function deleteJobPosting(id: string) {
        jobPostings.value = jobPostings.value.filter(job => job.id !== id);
    }

    function getApplicationsByJob(jobId: string) {
        return applications.value.filter(app => app.jobId === jobId);
    }

    function addApplication(app: Omit<Application, 'id' | 'createdAt'>) {
        const newApp: Application = {
            ...app,
            id: `app-${Date.now()}`,
            createdAt: new Date(),
        };
        applications.value.push(newApp);
    }

    function updateApplicationStatus(id: string, status: Application['status'], rejectionReason?: string) {
        const index = applications.value.findIndex(app => app.id === id);
        if (index !== -1) {
            applications.value[index] = {
                ...applications.value[index],
                status,
                rejectionReason
            };
        }
    }

    return {
        jobPostings,
        myJobs,
        applications,
        getJobById,
        addJobPosting,
        updateJobPosting,
        deleteJobPosting,
        getApplicationsByJob,
        addApplication,
        updateApplicationStatus
    };
});
