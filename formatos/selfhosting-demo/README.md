# Self-hosting demo · REAL_TALK.EXE

Docker Compose básicos para grabar la serie en la laptop (Ubuntu). Nada avanzado: lo justo para que funcione y se vea.

## Puertos (para que no choquen entre sí)

| Servicio | Reemplaza a | Abre en el navegador |
|---|---|---|
| Immich | Google Fotos | http://localhost:2283 |
| Jellyfin | Netflix | http://localhost:8096 |
| Navidrome | Spotify | http://localhost:4533 |
| Pi-hole | Bloqueador de anuncios para toda la casa | http://localhost:8081/admin |
| Vaultwarden | Bitwarden / LastPass | http://localhost:8082 |
| Uptime Kuma (ya lo tienes) | Monitoreo | http://localhost:3001 |

## Uso (igual para todos)

```bash
cd jellyfin            # entra a la carpeta del servicio
docker compose up -d   # lo enciende en segundo plano
docker compose logs -f # ver qué está pasando (Ctrl+C para salir)
docker compose down    # lo apaga (tus datos quedan en la carpeta)
```

Desde el celular (misma WiFi): cambia `localhost` por la IP de la laptop (`hostname -I` te la dice).

## Immich (es el único distinto)

Immich trae varios contenedores (base de datos, IA para búsqueda), así que se usa el archivo oficial, que siempre está actualizado:

```bash
cd immich
wget -O docker-compose.yml https://github.com/immich-app/immich/releases/latest/download/docker-compose.yml
wget -O .env https://github.com/immich-app/immich/releases/latest/download/example.env
nano .env              # cambia DB_PASSWORD por una clave tuya (solo letras y números)
docker compose up -d
```

La primera vez tarda: descarga las imágenes y el modelo de búsqueda inteligente. Hazlo antes del día de grabación.

## Pi-hole en Ubuntu: liberar el puerto 53

Ubuntu ya usa el puerto 53 para su propio DNS. Antes de encender Pi-hole:

```bash
sudo sed -r -i.orig 's/#?DNSStubListener=yes/DNSStubListener=no/g' /etc/systemd/resolved.conf
sudo sh -c 'rm /etc/resolv.conf && ln -s /run/systemd/resolve/resolv.conf /etc/resolv.conf'
sudo systemctl restart systemd-resolved
```

Para deshacerlo después de grabar:

```bash
sudo mv /etc/systemd/resolved.conf.orig /etc/systemd/resolved.conf
sudo ln -sf ../run/systemd/resolve/stub-resolv.conf /etc/resolv.conf
sudo systemctl restart systemd-resolved
```

Para probarlo sin tocar el router: en el celular, en la WiFi, pon DNS manual = IP de la laptop.

## Contenido para la demo (sin copyright)

- Jellyfin: películas de la Blender Foundation (Big Buck Bunny, Sintel, Tears of Steel) en `jellyfin/peliculas/`.
- Navidrome: el chiptune de REAL_TALK y música libre de derechos en `navidrome/musica/`.
- Immich: fotos tuyas de prueba, nada privado.
