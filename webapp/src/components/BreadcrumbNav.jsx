import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import { breadcrumbPath, navigationTree } from '../data/navigationTree';
import { useLocale } from '../contexts/LocaleContext';
import { getStrings } from '../i18n/strings';

export default function BreadcrumbNav({ activeItemId, onNavigate }) {
  const { locale } = useLocale();
  const text = getStrings(locale);
  const items = breadcrumbPath(navigationTree, activeItemId, locale);

  return (
    <BreadcrumbGroup
      items={items}
      ariaLabel={text.breadcrumbLabel}
      onFollow={(event) => {
        event.preventDefault();
        const target = event.detail.href;
        if (target && target !== 'home') onNavigate(target);
      }}
    />
  );
}
