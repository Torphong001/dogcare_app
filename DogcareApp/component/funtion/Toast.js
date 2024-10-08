import React, { forwardRef, useImperativeHandle } from 'react';
import { ToastAndroid } from 'react-native';

const Toast = forwardRef((props, ref) => {
  useImperativeHandle(ref, () => ({
    show: (message) => {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    },
  }));

  return null; // หรือสามารถ return component อื่น ๆ ได้ถ้าจำเป็น
});

export default Toast;