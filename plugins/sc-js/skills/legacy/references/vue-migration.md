# Vue Migration Reference

Key breaking changes and migration patterns — use during `01-scan` to identify migration work.

## Vue 2 → Vue 3

### Options API → Composition API

| Options API | Composition API (`<script setup>`) |
|---|---|
| `data() { return { x } }` | `const x = ref(...)` |
| `computed: { y() {} }` | `const y = computed(() => ...)` |
| `methods: { fn() {} }` | `function fn() {}` or `const fn = () => {}` |
| `watch: { x(val) {} }` | `watch(x, (val) => ...)` |
| `mounted() {}` | `onMounted(() => ...)` |
| `props: ['foo']` | `defineProps<{ foo: string }>()` |
| `this.$emit('ev', val)` | `const emit = defineEmits<{ ev: [val: T] }>()` |
| `this.$refs.el` | `const el = ref<HTMLElement>()` |
| `provide() { return { k: v } }` | `provide('k', v)` |
| `inject: ['k']` | `const k = inject('k')` |

### Breaking changes in Vue 3

| Change | Impact | Detection |
|---|---|---|
| `filters` removed | Must use computed or method | grep `\| filterName` in templates |
| `$listeners` merged into `$attrs` | `v-bind="$listeners"` breaks | grep `\$listeners` |
| `v-model` argument changed | `.sync` modifier removed | grep `\.sync` |
| Multiple root elements | No longer needs single root | low risk |
| `$children` removed | Use `ref` on child | grep `\$children` |
| `Vue.set` / `Vue.delete` removed | Native reactivity handles it | grep `Vue\.set\|Vue\.delete` |
| `$on`/`$off`/`$once` removed | Use mitt or Pinia | grep `\$on\(\|eventBus` |
| Transition class names changed | `v-enter` → `v-enter-from` | grep `v-enter[^-]` in CSS |

### Vuex → Pinia

| Vuex | Pinia |
|---|---|
| `createStore({ state, mutations, actions, getters })` | `defineStore(id, { state, actions, getters })` |
| `store.commit('SET_X', val)` | `store.x = val` or `store.setX(val)` |
| `store.dispatch('fetchX')` | `store.fetchX()` |
| `store.getters.computedX` | `store.computedX` |
| Namespaced module `auth/login` | Separate `useAuthStore()` |
| `mapState`, `mapGetters` in Options API | `storeToRefs(store)` in Composition API |

**Migration order**: Vuex→Pinia must complete BEFORE Options API→Composition API migration to avoid `this.$store` in migrated components.

## Nuxt 2 → Nuxt 3

| Nuxt 2 | Nuxt 3 |
|---|---|
| `asyncData()` | `useAsyncData()` / `useFetch()` |
| `fetch()` hook | `useFetch()` or `useAsyncData()` |
| `nuxt.config.js` buildModules | `nuxt.config.ts` modules |
| `@nuxtjs/composition-api` | Built-in Composition API |
| `~/plugins/foo.js` (class-based) | `defineNuxtPlugin()` |
| `store/` Vuex directory | `stores/` Pinia directory |
| `layouts/default.vue` `<nuxt/>` | `<NuxtPage/>` |
| `$config` | `useRuntimeConfig()` |
