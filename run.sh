#!/bin/bash

TOTAL_RUNS=48
LOG_DIR="./logs"
mkdir -p $LOG_DIR

echo "START SCHEDULE: $(date)" | tee -a $LOG_DIR/schedule.log

for ((i=1; i<=TOTAL_RUNS; i++)); do
  echo "========================================" | tee -a $LOG_DIR/schedule.log
  echo "RUN $i / $TOTAL_RUNS — $(date)" | tee -a $LOG_DIR/schedule.log
  echo "========================================" | tee -a $LOG_DIR/schedule.log

  node main.js 2>&1 | tail -n 12 > $LOG_DIR/run_$i.log

  echo "RUN $i DONE — $(date)" | tee -a $LOG_DIR/schedule.log

  # คำนวณเวลาที่ต้องรอจนถึงต้นชั่วโมงถัดไป
  if [ $i -lt $TOTAL_RUNS ]; then
    NOW=$(date +%s)
    NEXT_HOUR=$(( (NOW / 3600 + 1) * 3600 ))
    WAIT=$(( NEXT_HOUR - NOW ))
    echo "Waiting ${WAIT}s until next hour — $(date -d @$NEXT_HOUR)" | tee -a $LOG_DIR/schedule.log
    sleep $WAIT
  fi
done

echo "ALL $TOTAL_RUNS RUNS COMPLETE — $(date)" | tee -a $LOG_DIR/schedule.log
```

---

### ตัวอย่าง
```
RUN 1 เริ่ม 17:00 → จบ 17:14 → รอ 46 นาที → RUN 2 เริ่ม 18:00 ✅
RUN 2 เริ่ม 18:00 → จบ 18:14 → รอ 46 นาที → RUN 3 เริ่ม 19:00 ✅