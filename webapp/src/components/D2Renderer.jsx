import { useEffect, useState } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { getStrings } from '../i18n/strings';
import './D2Renderer.css';

const KROKI_ENDPOINT = 'https://kroki.io/d2/svg';

/**
 * D2 다이어그램 렌더러.
 *
 * ```d2 코드 블록을 Kroki API로 SVG로 변환해 표시합니다.
 * 클릭하면 모달로 확대되고 ESC 또는 배경 클릭으로 닫힙니다.
 *
 * 주의: D2 코드 안의 $ 문자는 \$ 로 이스케이프해야 합니다.
 */
export default function D2Renderer({ code }) {
  const { locale } = useLocale();
  const text = getStrings(locale);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      setError('');
      setSvg('');
      try {
        const response = await fetch(KROKI_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: code,
        });
        if (!response.ok) {
          throw new Error(`Kroki 응답 ${response.status}`);
        }
        const text = await response.text();
        if (cancelled) return;
        // 컨테이너를 최대한 채우도록 SVG 크기 속성을 강제합니다.
        setSvg(
          text
            .replace(/width="[^"]*"/, 'width="100%"')
            .replace(/height="[^"]*"/, 'height="auto"')
        );
      } catch (caught) {
        if (!cancelled) setError(caught.message || text.diagramErrorPrefix);
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [code]);

  useEffect(() => {
    if (!zoomed) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setZoomed(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [zoomed]);

  if (error) {
    return (
      <div className="d2-diagram-error">
        {text.diagramErrorPrefix}: {error}
        <pre>{code}</pre>
      </div>
    );
  }

  if (!svg) {
    return <div className="d2-diagram-loading">{text.diagramLoading}</div>;
  }

  return (
    <>
      <div
        className="d2-diagram-container"
        role="button"
        tabIndex={0}
        aria-label={text.diagramZoom}
        onClick={() => setZoomed(true)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setZoomed(true);
          }
        }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {zoomed && (
        <div
          className="d2-diagram-overlay"
          role="button"
          tabIndex={0}
          aria-label={text.diagramZoomClose}
          onClick={() => setZoomed(false)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') setZoomed(false);
          }}
        >
          <div
            className="d2-diagram-modal"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>
      )}
    </>
  );
}
