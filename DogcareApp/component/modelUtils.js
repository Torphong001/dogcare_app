import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';

// ฟังก์ชันโหลดโมเดลจาก asset
export const loadModel = async () => {
  await tf.ready(); // รอให้ TensorFlow พร้อมใช้งาน
  
  // โหลดไฟล์ model.json และ weights.bin
  const modelJson = require('../assets/model/model.json');
  const modelWeights = require('../assets/model/model.weights.bin');  
  

  // โหลดโมเดลจากไฟล์ที่กำหนด
  const model = await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
  return model;
};

// ฟังก์ชันแปลงรูปภาพเป็น Tensor
export const imageTensor = async (imageUri) => {
  const response = await fetch(imageUri, {}, { isBinary: true }); // โหลดภาพจาก URI
  const rawImageData = await response.arrayBuffer(); // แปลงเป็น binary data
  const imageTensor = decodeJpeg(new Uint8Array(rawImageData)); // แปลงเป็น Tensor ด้วย decodeJpeg
  return imageTensor;
};

// ฟังก์ชันประมวลผลรูปภาพและทำนายผล
export const predictImage = async (imageUri, model) => {
  const imageTensorData = await imageTensor(imageUri); // แปลงภาพเป็น Tensor
  const resizedImage = tf.image.resizeBilinear(imageTensorData, [224, 224]); // ปรับขนาดภาพเป็น 224x224
  const normalizedImage = resizedImage.div(255.0); // ปรับค่าภาพเป็นช่วง 0-1
  const prediction = await model.predict(normalizedImage.expandDims(0)); // ทำนายผลด้วยโมเดล
  const result = prediction.dataSync(); // รับผลลัพธ์

  // คำนวณสายพันธุ์ที่มีความน่าจะเป็นสูงสุด
  const classLabels = ['สายพันธุ์ 1', 'สายพันธุ์ 2', 'สายพันธุ์ 3']; // แทนที่ด้วย class ของโมเดลคุณ
  const topIndices = result
    .map((prob, idx) => [prob, idx])
    .sort((a, b) => b[0] - a[0]) // เรียงลำดับจากมากไปน้อย
    .slice(0, 3); // ดึงสายพันธุ์ที่มีความน่าจะเป็นสูงสุด 3 อันดับ

  // ส่งชื่อสายพันธุ์และความน่าจะเป็นกลับมา
  return topIndices.map(([prob, idx]) => ({
    className: classLabels[idx],
    probability: prob,
  }));
};
