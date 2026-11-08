@echo off
pushd "%~dp0"
call npm start -- analyze --config "..\config.json" --urls examples/recipe-urls.txt
set "result=%errorlevel%"
popd
exit /b %result%
