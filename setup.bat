@echo off
npx -y create-next-app@latest kanuni-ai --typescript --tailwind --eslint --app --src-dir src --import-alias "@/*" --use-npm --no-git
xcopy /E /H /Y kanuni-ai\* .
if exist kanuni-ai (
    rmdir /S /Q kanuni-ai
)
