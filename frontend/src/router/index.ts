import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './guards'

// Layouts
const AppLayout = () => import('@/components/layout/AppLayout.vue')

// Pages
const LoginPage = () => import('@/pages/auth/LoginPage.vue')
const RegisterPage = () => import('@/pages/auth/RegisterPage.vue')
const GitHubCallbackPage = () => import('@/pages/auth/GitHubCallbackPage.vue')
const EmailVerificationPendingPage = () => import('@/pages/auth/EmailVerificationPendingPage.vue')
const EmailVerifiedPage = () => import('@/pages/auth/EmailVerifiedPage.vue')
const ForgotPasswordPage = () => import('@/pages/auth/ForgotPasswordPage.vue')
const ResetPasswordPage = () => import('@/pages/auth/ResetPasswordPage.vue')
const DashboardPage = () => import('@/pages/app/DashboardPage.vue')
const ClientsPage = () => import('@/pages/app/ClientsPage.vue')
const ProjectsPage = () => import('@/pages/app/ProjectsPage.vue')
const TasksPage = () => import('@/pages/app/TasksPage.vue')
const FinancePage = () => import('@/pages/app/FinancePage.vue')
const SubscriptionsPage = () => import('@/pages/app/SubscriptionsPage.vue')
const TimeTrackingPage = () => import('@/pages/app/TimeTrackingPage.vue')
const DocsPage = () => import('@/pages/app/DocsPage.vue')
const AgendaPage = () => import('@/pages/app/AgendaPage.vue')
const SettingsPage = () => import('@/pages/app/SettingsPage.vue')
const NotificationsPage = () => import('@/pages/NotificationsPage.vue')
const AdminUsersPage = () => import('@/pages/app/AdminUsersPage.vue')
const QuotesPage = () => import('@/pages/app/QuotesPage.vue')
const NotesPage = () => import('@/pages/app/NotesPage.vue')
const ConnectionsPage = () => import('@/pages/app/ConnectionsPage.vue')
const GoalsPage = () => import('@/pages/app/GoalsPage.vue')

const HelpPage = () => import('@/pages/HelpPage.vue')
const PrivacyPolicyPage = () => import('@/pages/PrivacyPolicyPage.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/help',
      name: 'help',
      component: HelpPage
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: PrivacyPolicyPage
    },
    {
      path: '/',
      redirect: { name: 'register' },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
      meta: { guestOnly: true }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterPage,
      meta: { guestOnly: true }
    },
    {
      path: '/auth/github/callback',
      name: 'github-callback',
      component: GitHubCallbackPage,
    },
    {
      path: '/auth/email-pending',
      name: 'email-pending',
      component: EmailVerificationPendingPage,
    },
    {
      path: '/auth/email-verified',
      name: 'email-verified',
      component: EmailVerifiedPage,
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordPage,
      meta: { guestOnly: true },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPasswordPage,
      meta: { guestOnly: true },
    },
    {
      path: '/app',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        { path: 'dashboard',      name: 'dashboard',      component: DashboardPage },
        { path: 'clients',        name: 'clients',        component: ClientsPage },
        { path: 'projects',       name: 'projects',       component: ProjectsPage },
        { path: 'projects/:id',   name: 'project-detail', component: () => import('@/pages/app/ProjectDetailPage.vue') },
        { path: 'projects/:id/github', name: 'project-github', component: () => import('@/pages/app/ProjectGithubPage.vue') },
        { path: 'tasks',          name: 'tasks',          component: TasksPage },
        { path: 'finance',        name: 'finance',        component: FinancePage },
        { path: 'assistant',      name: 'assistant',      component: () => import('@/pages/app/AssistantPage.vue') },
        { path: 'reports',        name: 'reports',        component: () => import('@/pages/app/ReportsPage.vue') },
        { path: 'subscriptions',  name: 'subscriptions',  component: SubscriptionsPage },
        { path: 'subscriptions/:id', name: 'subscription-detail', component: () => import('@/pages/app/SubscriptionDetailPage.vue') },
        { path: 'time-tracking',  name: 'time-tracking',  component: TimeTrackingPage },
        { path: 'goals',          name: 'goals',          component: GoalsPage },
        { path: 'docs',           name: 'docs',           component: DocsPage },
        { path: 'agenda',         name: 'agenda',         component: AgendaPage },
        { path: 'settings',       name: 'settings',       component: SettingsPage },
        { path: 'notifications',  name: 'notifications',  component: NotificationsPage },
        { path: 'admin-users',    name: 'admin-users',    component: AdminUsersPage },
        { path: 'quotes',         name: 'quotes',         component: QuotesPage },
        { path: 'notes',          name: 'notes',          component: NotesPage },
        { path: 'integrations',   name: 'integrations',   component: ConnectionsPage },
        { path: 'planner',        name: 'planner',        component: () => import('@/pages/app/PlannerPage.vue') },
        { path: '',               redirect: { name: 'dashboard' } }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'register' }
    }
  ],
})

router.beforeEach(authGuard)

export default router
