import { createMemoryHistory, createRouter } from 'vue-router'

const routes = [
    {
        path: '/',
        component: () => import('./../pages/menus.vue')
    },
    {
        path: '/watermark',
        name: 'watermark',
        component: () => import('./../components/watermark.vue')
    },
    {
        path: '/theme',
        name: 'theme',
        component: () => import('./../components/theme.vue')
    }
]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router