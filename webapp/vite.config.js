import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Cloudscape 와 구문 하이라이터가 번들의 대부분을 차지합니다.
        // 별도 청크로 분리하면 콘텐츠만 바뀔 때 이 청크들이 캐시에 남습니다.
        manualChunks: {
          cloudscape: [
            '@cloudscape-design/components',
            '@cloudscape-design/global-styles',
          ],
          highlighter: ['react-syntax-highlighter'],
          markdown: ['react-markdown', 'remark-gfm', 'rehype-raw'],
        },
      },
    },
    // Cloudscape 청크(약 715KB)는 디자인 시스템 자체 크기이므로 줄일 수 없습니다.
    // 그보다 커지는 청크가 생기면 경고로 알아차릴 수 있게 임계값을 잡습니다.
    chunkSizeWarningLimit: 750,
  },
});
