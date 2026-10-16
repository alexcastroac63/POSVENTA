#!/bin/sh
# Configuración e inicialización del bucket S3 en MinIO para fotos de menús y comprobantes
echo "Esperando que el contenedor MinIO esté disponible en el puerto 9000..."
sleep 2

# Configurar alias local de MinIO Client (mc)
mc alias set local http://minio-s3:9000 minio_resto_admin minio_resto_secret_2026

# Crear bucket para almacenamiento de medios gastronómicos
mc mb --ignore-existing local/restaurant-media

# Configurar política pública de lectura para carga directa en tablets y terminales
mc anonymous set download local/restaurant-media

echo "Bucket S3 'restaurant-media' aprovisionado y listo para producción."
