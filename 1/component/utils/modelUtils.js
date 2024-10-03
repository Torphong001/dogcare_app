// src/modelUtils.js
import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';
import { decodeJpeg, fetch } from '@tensorflow/tfjs-react-native';
import { launchImageLibrary } from 'react-native-image-picker';

export const loadModel = async () => {
  await tf.ready(); // รอให้ TensorFlow พร้อมใช้งาน
  
  const modelJson = require('../../assets/model/model.json');
  const modelWeights = [require('../../assets/model/weights.bin')];

  const model = await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
  return model;
};

export const pickImage = () => {
  const options = {
    mediaType: 'photo',
    includeBase64: false,
  };

  return new Promise((resolve, reject) => {
    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        reject('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
        reject('ImagePicker Error');
      } else {
        const uri = response.assets[0].uri; // รับ URI ของภาพ
        resolve(uri); // ส่ง URI กลับ
      }
    });
  });
};

export const imageTensor = async (imageUri) => {
  const response = await fetch(imageUri, {}, { isBinary: true });
  const rawImageData = await response.arrayBuffer();
  const imageTensor = decodeJpeg(new Uint8Array(rawImageData));
  return imageTensor;
};

export const predictImage = async (imageUri, model) => {
  const imageTensorData = await imageTensor(imageUri); // แปลงภาพเป็น Tensor
  const resizedImage = tf.image.resizeBilinear(imageTensorData, [224, 224]); // ปรับขนาดภาพ
  const prediction = await model.predict(resizedImage.expandDims(0)); // ทำนายผล
  const result = prediction.dataSync(); // รับค่าผลลัพธ์

  // คำนวณสายพันธุ์ที่มีความน่าจะเป็นสูงสุด
  const classIndex = result.indexOf(Math.max(...result));
  const classLabels = ['สายพันธุ์ 1', 'สายพันธุ์ 2', 'สายพันธุ์ 3']; // เปลี่ยนให้ตรงกับสายพันธุ์ของคุณ
  return classLabels[classIndex];
};
