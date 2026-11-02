@echo off
REM Jalankan dari folder utama project (yang berisi package.json). Aman: rmdir hanya menghapus folder KOSONG.
if exist "app\page.tsx" del "app\page.tsx" & echo Dihapus: app\page.tsx
if exist "app\admin\pesanan\[id]" rmdir "app\admin\pesanan\[id]" & echo Dihapus: app\admin\pesanan\[id]
if exist "app\api\auth\callback" rmdir "app\api\auth\callback" & echo Dihapus: app\api\auth\callback
if exist "app\api\auth" rmdir "app\api\auth" & echo Dihapus: app\api\auth
if exist "app\api\upload" rmdir "app\api\upload" & echo Dihapus: app\api\upload
if exist "components\site-footer.tsx" del "components\site-footer.tsx" & echo Dihapus: components\site-footer.tsx
echo Selesai.
pause
