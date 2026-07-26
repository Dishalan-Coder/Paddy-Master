import { MessageCircle } from 'lucide-react';
import Button from '../common/Button';
import { useTranslation } from 'react-i18next';
export default function ContactFarmerButton({ farmerId, onOpen }) {
  const { t } = useTranslation();
  return (
    <Button
      variant="secondary"
      icon={MessageCircle}
      onClick={() => onOpen(farmerId)}
    >
      {t('contact_farmer')}
    </Button>
  );
}
