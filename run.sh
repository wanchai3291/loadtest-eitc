#!/bin/bash

TOTAL_RUNS=48
INTERVAL_SEC=3600
LOG_DIR="./logs"
mkdir -p $LOG_DIR

echo "START SCHEDULE: $(date)" | tee -a $LOG_DIR/schedule.log

for ((i=1; i<=TOTAL_RUNS; i++)); do
  echo "========================================" | tee -a $LOG_DIR/schedule.log
  echo "RUN $i / $TOTAL_RUNS — $(date)" | tee -a $LOG_DIR/schedule.log
  echo "========================================" | tee -a $LOG_DIR/schedule.log

  node main.js 2>&1 | tail -n 12 > $LOG_DIR/run_$i.log

  echo "RUN $i DONE — $(date)" | tee -a $LOG_DIR/schedule.log

  if [ $i -lt $TOTAL_RUNS ]; then
    echo "Waiting until next run..." | tee -a $LOG_DIR/schedule.log
    sleep $INTERVAL_SEC
  fi
done

echo "ALL $TOTAL_RUNS RUNS COMPLETE — $(date)" | tee -a $LOG_DIR/schedule.log