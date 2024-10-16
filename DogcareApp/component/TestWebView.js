import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

const CustomerChat = () => {
  const htmlContent = `
    <html>
      <head>
        <script>
          window.onload = function() { BN.init({ version: '1.0' }) }
        </script>
        <script>
          (function(d, s, id) {
            var js, bjs = d.getElementsByTagName(s)[0];
            if(d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = 'https://console.botnoi.ai/customerchat/index.js';
            bjs.parentNode.insertBefore(js, bjs);
          }(document, 'script', 'bn-jssdk'));
        </script>
      </head>
      <body>
        <div id="bn-root"></div>
        <div class="bn-customerchat"
          bot_id="670bc643f015af67717b26e7"
          bot_logo="https://bn-sme-production-ap-southeast-1.s3.amazonaws.com/670bc643f015af67717b26e7/ccb24bc8-ba21-4e9d-a377-d2b021e42204.jpg"
          bot_name="แชทผู้เชี่ยวชาญ"
          theme_color="#FFFFFF"
          locale="th"
          logged_in_greeting="แชทกับบอทเพื่อรับการประเมินความเสี่ยงโรค"
          greeting_message="สวัสดีครับ สุนัขของคุณมีอาการผิดปกติอย่างไรบ้าง"
          default_open="true">
        </div>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview} // ใช้ style ที่กำหนด
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '150%',
    height: '100%',
    left: -100,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webview: {
    width: Dimensions.get('window').width , // ขยายความกว้างเต็มหน้าจอ
    height: Dimensions.get('window').height + 100, // ปรับความสูงให้ต่ำกว่า 100px
  },
});

export default CustomerChat;
