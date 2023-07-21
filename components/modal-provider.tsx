'use client';
import React, { useEffect, useState } from 'react';
import ProModal from '@/components/pro-modal';

const ModalProvider = () => {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return (
    <div>
      <ProModal />
    </div>
  );
};

export default ModalProvider;
