// components/ui/GuideDrawer.jsx
import * as React from 'react';
import SlideOver from '@/components/ui/SlideOver';

export default function GuideDrawer({ open, onClose, title = 'Personas Guide', children }) {
  return (
	<SlideOver open={open} onClose={onClose} title={title}>
	  {children}
	</SlideOver>
  );
}