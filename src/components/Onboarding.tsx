import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Camera, BarChart3, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/I18nContext';

const icons = [Leaf, Camera, BarChart3, Shield];

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);

  const slides = [
    { title: t('onboarding1Title'), text: t('onboarding1Text') },
    { title: t('onboarding2Title'), text: t('onboarding2Text') },
    { title: t('onboarding3Title'), text: t('onboarding3Text') },
    { title: t('onboarding4Title'), text: t('onboarding4Text') },
  ];

  const Icon = icons[step];

  return (
    <div className="fixed inset-0 z-[70] bg-background flex flex-col items-center justify-center p-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center text-center max-w-sm"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
            <Icon className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-3">{slides[step].title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{slides[step].text}</p>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-2 mt-8">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-primary' : 'bg-muted'}`}
          />
        ))}
      </div>

      <div className="mt-8 w-full max-w-sm">
        {step < slides.length - 1 ? (
          <Button onClick={() => setStep(step + 1)} className="w-full">{t('next')}</Button>
        ) : (
          <Button onClick={onComplete} className="w-full">{t('getStarted')}</Button>
        )}
      </div>

      {step < slides.length - 1 && (
        <button onClick={onComplete} className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors">
          {t('skip')}
        </button>
      )}
    </div>
  );
}
