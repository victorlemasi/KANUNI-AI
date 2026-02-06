@echo off
git init
git remote add origin https://github.com/victorlemasi/KANUNI-AI.git
git add .
git commit -m "System Upgrade: KANUNI AI Platform with Llama-3-8B Reasoning"
git branch -M main
git push -u origin main
