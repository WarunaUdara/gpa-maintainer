import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://warunaudara.github.io',
  base: '/gpa-maintainer',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
