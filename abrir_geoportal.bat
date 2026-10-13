@echo off
chcp 65001 > nul
title Geoportal Municipal de Craíbas - AL
echo ========================================================
echo   GEOPORTAL MUNICIPAL DE CRAÍBAS - ALAGOAS
echo   Gestão Territorial, Meio Ambiente e Dados Espaciais
echo ========================================================
echo.
echo Iniciando o Geoportal no seu navegador padrão...
echo.
start "" "%~dp0index.html"
exit
