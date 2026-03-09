# สร้างไฟล์ run.sh
cat > /path/to/your/project/run.sh << 'EOF'
#!/bin/bash
cd /path/to/your/project
source .env  # โหลด env vars ถ้าไม่ได้ใช้ dotenv
/usr/bin/node script.js >> /var/log/kafka-loadtest.log 2>&1
EOF

chmod +x /path/to/your/project/run.sh