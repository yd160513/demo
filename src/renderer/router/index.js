import { createMemoryHistory, createRouter } from 'vue-router'

const routes = [
    {
        path: '/',
        redirect: '/menus',
        component: () => import('../pages/index/index.vue')
    },
    {
        path: '/menus',
        name: 'menus',
        component: () => import('../pages/index/components/menus.vue')
    },
    {
        path: '/watermark',
        name: 'watermark',
        component: () => import('../components/watermark.vue')
    },
    {
        path: '/theme',
        name: 'theme',
        component: () => import('../components/theme.vue')
    },
    {
        path: '/other',
        name: 'other',
        component: () => import('../pages/other/index.vue')
    }
]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router