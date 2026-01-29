import React from 'react';
import s from './LoadingOverlay.module.scss';

function LoadingOverlay({ show }) {
  if (!show) return null;

  return (
    <div className={s.overlay}>
      <div className={s.spinnerContainer}>
        <div className={s.spinner}></div>
      </div>
    </div>
  );
}

export default LoadingOverlay;