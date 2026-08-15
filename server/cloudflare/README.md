# HTTPS через Cloudflare Tunnel

1. Установите `cloudflared` на сервер.
2. Выполните `cloudflared tunnel login`.
3. Создайте туннель: `cloudflared tunnel create messenger`.
4. Привяжите DNS: `cloudflared tunnel route dns messenger chat.example.com`.
5. Заполните `config.yml` значениями своего tunnel ID и домена.
6. Запустите: `cloudflared tunnel --config ./cloudflare/config.yml run`.
7. В `.env` для HTTPS установите `COOKIE_SECURE=1`.

Cloudflare Tunnel сам выдаёт HTTPS-сертификат посетителю. Сертификаты `cert.pem/key.pem` в приложении больше не нужны.
