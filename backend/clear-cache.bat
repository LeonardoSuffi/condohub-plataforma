@echo off
echo Limpando cache do Laravel...
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
echo Cache limpo com sucesso!
pause
