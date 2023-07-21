'use client';
import { useEffect } from 'react';
import { Crisp } from 'crisp-sdk-web';

export const CrispChat = () => {
  useEffect(() => {
    Crisp.configure('e904f081-acb3-4749-a843-bcb93303543b');
  }, []);
  return null;
};
