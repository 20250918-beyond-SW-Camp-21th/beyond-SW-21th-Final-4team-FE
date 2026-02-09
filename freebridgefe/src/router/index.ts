import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'landing',
        component: () => import('@/views/auth/LandingView.vue')
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('@/views/auth/LoginView.vue')
    },
    {
        path: '/signup',
        name: 'signup',
        component: () => import('@/views/auth/SignupView.vue')
    },
    {
        path: '/guide',
        component: () => import('@/layouts/PlatformLayout.vue'),
        children: [
            {
                path: '',
                name: 'guide',
                component: () => import('@/views/Guide/UserGuideView.vue'),
                meta: { requiresAuth: false }
            }
        ]
    },

    // Employer Routes
    {
        path: '/employer',
        component: () => import('@/layouts/PlatformLayout.vue'),
        meta: { requiresAuth: true, role: 'EMPLOYER' },
        children: [
            {
                path: 'dashboard',
                name: 'employer.dashboard',
                component: () => import('@/views/employer/Dashboard/DashboardView.vue')
            },
            {
                path: 'jobs',
                name: 'employer.jobs',
                component: () => import('@/views/employer/Jobs/JobList.vue')
            },
            {
                path: 'applications',
                name: 'employer.applications',
                component: () => import('@/views/employer/Applications/ApplicationList.vue')
            },
            {
                path: 'recommended',
                name: 'employer.recommended',
                component: () => import('@/views/employer/Recommended/RecommendedView.vue')
            },
            {
                path: 'freelancers',
                name: 'employer.freelancers',
                component: () => import('@/views/employer/Freelancers/FreelancerSearchView.vue')
            },
            {
                path: 'contracts',
                name: 'employer.contracts',
                component: () => import('@/views/employer/Contracts/ContractsView.vue')
            },
            {
                path: 'settlements',
                name: 'employer.settlements',
                component: () => import('@/views/freelancer/Settlement/SettlementView.vue')
            },
            {
                path: 'contracts/create',
                name: 'employer.contracts.create',
                component: () => import('@/views/employer/Contracts/CreateContractView.vue')
            },
            {
                path: 'mypage',
                name: 'employer.mypage',
                component: () => import('@/views/employer/MyPage/MyPageView.vue')
            },
            {
                path: 'review',
                name: 'employer.review',
                component: () => import('@/views/employer/Review/ReviewList.vue')
            },
            {
                path: 'review/write',
                name: 'employer.review.write',
                component: () => import('@/views/employer/Review/ReviewWrite.vue')
            },
            {
                path: 'freelancer/:id',
                name: 'employer.freelancer.profile',
                component: () => import('@/views/employer/Freelancer/FreelancerProfileView.vue')
            },
            {
                path: 'dashboard',
                name: 'employer.dashboard',
                component: () => import('@/views/employer/Dashboard/DashboardView.vue')
            }
        ]
    },

    // Freelancer Routes
    {
        path: '/freelancer',
        component: () => import('@/layouts/PlatformLayout.vue'),
        meta: { requiresAuth: true, role: 'FREELANCER' },
        children: [
            {
                path: 'jobs',
                name: 'freelancer.jobs',
                component: () => import('@/views/freelancer/Jobs/JobBrowser.vue')
            },
            {
                path: 'applications',
                name: 'freelancer.applications',
                component: () => import('@/views/freelancer/Applications/MyApplications.vue')
            },
            {
                path: 'recommended',
                name: 'freelancer.recommended',
                redirect: '/freelancer/jobs'
            },
            {
                path: 'contracts',
                name: 'freelancer.contracts',
                component: () => import('@/views/freelancer/Contracts/ContractList.vue')
            },
            {
                path: 'settlement',
                name: 'freelancer.settlement',
                component: () => import('@/views/freelancer/Settlement/SettlementView.vue')
            },
            {
                path: 'mypage',
                name: 'freelancer.mypage',
                component: () => import('@/views/freelancer/MyPage/MyPageFreelancer.vue')
            },
            {
                path: 'review',
                name: 'freelancer.review',
                component: () => import('@/views/freelancer/Review/ReviewList.vue')
            },
            {
                path: 'review/write',
                name: 'freelancer.review.write',
                component: () => import('@/views/freelancer/Review/ReviewWrite.vue')
            },
        ]
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

// Navigation Guard
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    // Check auth requirement
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/login')
        return
    }

    // Check role requirement
    if (to.meta.role && authStore.user?.role !== to.meta.role) {
        if (authStore.user?.role === 'EMPLOYER') {
            next('/employer/dashboard')
        } else {
            next('/freelancer/jobs')
        }
        return
    }

    next()
})

export default router
