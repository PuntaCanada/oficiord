# OficioRD – denuncias de anuncios (fase piloto)

El sistema permite informar sobre una publicación aprobada por motivo **spam, posible estafa, contenido inapropiado, privacidad u otro**. No acusa automáticamente al proveedor de culpabilidad ni suspende usuarios. El moderador revisa cada denuncia y puede retirar el anuncio.

## Despliegue
1. En Cloudflare D1 **oficiord-db → Console**, ejecutar el contenido de `migrations/0002_reports.sql` **una sola vez**. No reemplazar la primera migración.
2. Los endpoints quedan desplegados automáticamente tras incorporar el código:
   - Público: `POST /api/reports`
   - Privado: `GET /api/admin/reports?status=pending`, `POST /api/admin/reports`
3. Entrar en `/admin/` con la clave administrativa existente y cambiar la bandeja a **Denuncias**. Ningún secreto pasa a GitHub.
4. Antes de habilitar envíos públicos: revisar aviso de privacidad, mecanismo de borrado, retención, consentimiento, normativa aplicable y ejecutar pruebas con datos ficticios. Solo entonces definir variable Production `REPORTS_ENABLED=true` y desplegar de nuevo. **No hacerlo todavía.**
5. `SUBMISSIONS_ENABLED` permanece **ausente o false** de forma permanente durante las pruebas del sistema de denuncias.

## Protección y límites
- La API devuelve HTTP 503 `REPORTS_NOT_ENABLED` hasta habilitar explícitamente informes.
- Turnstile validado en servidor y límite básico de 5 informes por IP/hora, con IP seudonimizada; no se guarda el IP en claro.
- No se solicitan identidad ni contacto del denunciante. Los detalles son opcionales y limitados a 1000 caracteres.
- Solo se puede denunciar una publicación con estado `approved` y un UUID válido.
- Las denuncias no se muestran al público. Se visualizan solo en la interfaz administrativa protegida por `MODERATION_ADMIN_KEY`.
- La retirada del anuncio es una decisión de moderación humana, no automática.
- El borrado de una publicación elimina sus denuncias asociadas mediante `ON DELETE CASCADE`, una vez aplicada la migración.
- Falta añadir auditoría formal de moderación, apelaciones y política pública de retención antes de uso real.
- **Rotar el primer administrador secreto**: apareció previamente en la conversación; crear uno nuevo fuera del chat y guardarlo en Cloudflare Pages como Secret.

## Pruebas sin información real
GitHub Actions: `OficioRD report system checks`. Ejecuta ambas migraciones en SQLite en memoria, valida los scripts y comprueba que los envíos permanecen deshabilitados.

## Prueba de migración en producción
- Abrir `https://oficiord.pages.dev/api/health` tras el despliegue; `reportingSchema: "ready"` confirma que las tablas `reports` y `report_rate_limits` existen en la D1 vinculada a Production.
- Esta prueba es solo de lectura y no crea datos ni activa las denuncias.
- El workflow `Check OficioRD public API` también comprueba el esquema, acceso anónimo denegado y las dos entradas públicas desactivadas.
- Los tests no validan la autenticación con clave real ni el ciclo completo de denuncia (requiere pruebas controladas con datos ficticios y medidas de privacidad previas).
