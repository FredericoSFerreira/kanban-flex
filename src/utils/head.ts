import { useHead } from '@vueuse/head';
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import metaTags from '@/i18n/locales/meta-tags';

export function useMetaTags() {
  const { t, locale } = useI18n();
  const route = useRoute();

  // Get the route name without the query parameters
  const routeName = computed(() => {
    return route.name?.toString().toLowerCase() || 'home';
  });

  // Get meta tags for the current route and language
  const getMetaTags = computed(() => {
    const currentLocale = locale.value as 'en' | 'pt-BR';
    const routeKey = routeName.value as keyof typeof metaTags.en;

    // Default to home if the route doesn't have specific meta tags
    const tags = metaTags[currentLocale][routeKey] || metaTags[currentLocale].home;

    return {
      title: tags.title,
      description: tags.description,
      keywords: tags.keywords,
      og: {
        title: tags.og.title,
        description: tags.og.description,
        url: window.location.href,
        locale: currentLocale,
        site_name: 'KanbanFlex',
        type: 'website',
        image: `${window.location.origin}/logo-kanbanflex.png`,
      }
    };
  });

  // Set meta tags
  const setMetaTags = () => {
    const tags = getMetaTags.value;

    useHead({
      title: tags.title,
      meta: [
        { name: 'description', content: tags.description },
        { name: 'keywords', content: tags.keywords },
        { property: 'og:title', content: tags.og.title },
        { property: 'og:description', content: tags.og.description },
        { property: 'og:url', content: tags.og.url },
        { property: 'og:locale', content: tags.og.locale },
        { property: 'og:site_name', content: tags.og.site_name },
        { property: 'og:type', content: tags.og.type },
        { property: 'og:image', content: tags.og.image },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: tags.og.title },
        { name: 'twitter:description', content: tags.og.description },
        { name: 'twitter:image', content: tags.og.image },
      ],
      link: [
        { rel: 'canonical', href: tags.og.url },
      ],
    });
  };

  // Watch for changes in route or language
  watch([routeName, locale], () => {
    setMetaTags();
  }, { immediate: true });

  return {
    setMetaTags,
    getMetaTags,
  };
}
