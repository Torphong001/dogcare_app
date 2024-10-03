import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import axios from 'axios';

const SymptomChat = () => {
  const allSymptoms = ['อาเจียน', 'ท้องเสีย', 'ปัสสาวะผิดปกติ', 'เบื่ออาหาร', 'กินน้ำผิดปกติ', 'ขนร่วง', 'คัน', 'เคลื่อนไหวลำบาก', 'เหงือกซีด', 'กลิ่นตัว', 'กลิ่นปาก', 'ปัสสาวะมาก', 'กระหายน้ำ', 'ก้าวร้าว'];  // อาการทั้งหมด
  const [remainingSymptoms, setRemainingSymptoms] = useState(allSymptoms);  // อาการที่เหลือ
  const [symptoms, setSymptoms] = useState([]);  // เก็บข้อมูลอาการที่ผู้ใช้เลือก
  const [diseaseInfo, setDiseaseInfo] = useState(null);  // เก็บข้อมูลโรคที่ค้นหาได้
  const [round, setRound] = useState(0);  // รอบที่ถาม (0-2)
  const [currentSymptom, setCurrentSymptom] = useState('');  // อาการปัจจุบันที่ถาม

  // ฟังก์ชันสำหรับเลือกอาการแบบสุ่มจากอาการที่เหลือ
  const getRandomSymptom = () => {
    const randomIndex = Math.floor(Math.random() * remainingSymptoms.length);
    return remainingSymptoms[randomIndex];
  };

  // ฟังก์ชันสำหรับเริ่มการถามอาการ
  const startChat = () => {
    const newSymptom = getRandomSymptom();
    setCurrentSymptom(newSymptom);
    setRound(1);  // เริ่มจากรอบที่ 1
    setSymptoms([]); // รีเซ็ตอาการที่เลือก
    setDiseaseInfo(null); // รีเซ็ตข้อมูลโรคที่ค้นหา
    setRemainingSymptoms(allSymptoms); // รีเซ็ตอาการที่เหลือทั้งหมด
  };

  // ฟังก์ชันเมื่อผู้ใช้กดปุ่มตอบว่าใช่ (อาการนี้ตรง)
  const handleSymptomPress = async () => {
    const updatedSymptoms = [...symptoms, currentSymptom];
    setSymptoms(updatedSymptoms);  // เก็บอาการที่เลือก

    // ลบอาการที่ถูกถามแล้วออกจาก remainingSymptoms
    setRemainingSymptoms(remainingSymptoms.filter(symptom => symptom !== currentSymptom));

    await findDisease(updatedSymptoms);  // ลองค้นหาโรคจากอาการที่มี
  };

  // ฟังก์ชันสำหรับค้นหาโรคจาก API โดยเทียบกับอาการที่ผู้ใช้เลือก
  const findDisease = async (selectedSymptoms) => {
    try {
      const response = await axios.post('http://192.168.3.51/dogcare/getdiseases.php', { symptoms: selectedSymptoms });  // ส่งอาการไปยัง API
      const disease = response.data.disease;  // รับข้อมูลโรคที่ค้นหาได้จาก API

      if (disease.diseases_name === 'ไม่พบโรคที่ตรงกับอาการ' && round < 3) {
        // ถ้าไม่พบโรคและยังไม่ครบ 3 รอบ
        nextRound();
      } else if (round === 3) {
        // ถ้าครบ 3 รอบแล้วยังไม่พบโรค
        setDiseaseInfo({ diseases_name: 'สุขภาพปกติ', treat: 'ไม่มีการรักษา' });
      } else {
        setDiseaseInfo(disease);  // ถ้าพบโรค ให้แสดงข้อมูลโรค
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ฟังก์ชันสำหรับข้ามไปยังรอบถัดไป
  const nextRound = () => {
    if (round < 3) {
      const newSymptom = getRandomSymptom();
      setCurrentSymptom(newSymptom);
      setRound(round + 1);
    }
  };

  return (
    <View>
      {!diseaseInfo ? (
        <>
          {round === 0 ? (
            <Button title="เริ่มต้นแชท" onPress={startChat} />
          ) : (
            <>
              <Text>คุณมีอาการนี้หรือไม่: {currentSymptom}</Text>
              <Button title="ใช่" onPress={handleSymptomPress} />
              <Button title="ไม่ใช่" onPress={nextRound} />
            </>
          )}
        </>
      ) : (
        <View>
          <Text>คุณอาจจะเป็นโรค: {diseaseInfo.diseases_name}</Text>
          <Text>วิธีการรักษา: {diseaseInfo.treat}</Text>
          {/* ปุ่มรีเซ็ตเพื่อเริ่มแชทใหม่ */}
          <Button title="เริ่มแชทใหม่" onPress={startChat} />
        </View>
      )}
    </View>
  );
};

export default SymptomChat;
