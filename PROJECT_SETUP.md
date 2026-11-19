# OficioRD — MVP piloto
Marketplace piloto de profesionales y trabajos en República Dominicana, empezando por Higüey, Bávaro y Punta Cana. Sitio independiente, no afiliado a MyHammer.

## Estado
- Sitio español, adaptable al móvil, categorías y filtros.
- GET `/api/submissions`: solo publicaciones aprobadas, sin direcciones de contacto.
- POST `/api/submissions`: solicitudes pendientes de moderación; requiere Cloudflare D1 y Turnstile.
- Página de formulario bloqueada por defecto, incluso si Turnstile está configurado, hasta la aprobación de lanzamiento.
- No hay cuentas, pagos, mensajería, notificaciones ni sistema de propuestas reales todavía.

## Configurar Cloudflare Pages
1. Conectar repositorio `PuntaCanada/oficiord` con Cloudflare Pages. Framework: None; build command: vacío; output: `.`.
2. Crear base Cloudflare D1 `oficiord-db`. Ejecutar `migrations/0001_init.sql` en D1 Console.
3. Asociar binding `DB` a esa base en Pages (Production y Preview si procede).
4. Crear widget Cloudflare Turnstile para dominio Pages. Configurar variable `TURNSTILE_SITE_KEY` (pública) y secret `TURNSTILE_SECRET` (¡nunca poner en GitHub!). Desplegar de nuevo.
5. El formulario sigue cerrado por defecto. Para abrirlo en el futuro, además de D1 y Turnstile configurados, se requiere `SUBMISSIONS_ENABLED=true`, pero **solo después** de contar con información de privacidad real, responsable del tratamiento, procedimiento de eliminación y moderación, y un plan de prueba adecuado.
6. Antes de activar, probar con datos ficticios y comprobar que POST devuelve `pending` y GET no lo publica hasta aprobarlo.

## Moderación provisional
En la consola D1:
```sql
SELECT id,kind,title,city,category,description,created_at FROM submissions WHERE status='pending' ORDER BY created_at DESC;
-- Revisar textos para evitar publicar datos personales o contenido inapropiado:
UPDATE submissions SET status='approved' WHERE id='UUID_A_REVISAR';
```

## Seguridad y limitaciones
No publicar comercialmente ni recolectar datos reales hasta crear aviso legal, política de privacidad, contacto de responsable, periodo de retención y borrado, un proceso de denuncia y un panel seguro de moderación. El consentimiento actual es un marcador provisional, no una política de privacidad terminada. Las reglas de limitación por IP son una protección básica (no un sistema antifraude completo). Las cuotas Free pueden limitar disponibilidad.

## Coste
Sin servicios de pago configurados. Planeado para GitHub + Cloudflare Pages/D1/Turnstile en los límites gratuitos. Una base de datos real y widget Turnstile aún deben conectarse.

## Estado de lanzamiento (2026-11-19)
- Confirmado por el operador: `/api/health` responde `{"ok":true,"database":"connected"}`.
- El ajuste `SUBMISSIONS_ENABLED` no debe añadirse aún (valor por defecto = deshabilitado).
- Solo se usa el sitekey público en variables; el secreto Turnstile nunca debe aparecer en el repositorio, URL o mensajes públicos.

## Moderación protegida (preparada, no habilitada)
- Interfaz: `/admin/`, API: `/api/admin/submissions`.
- Para habilitar el acceso administrativo en Pages Production, generar una clave aleatoria **única de al menos 32 caracteres** y guardarla solo en Cloudflare como secret `MODERATION_ADMIN_KEY`. No usar el secret de Turnstile como clave administrativa.
- Tras desplegar, el administrador introduce esa clave directamente en `/admin/`. La página no guarda la clave en almacenamiento local, cookies ni URL.
- Hasta que se configure el secret, la API de moderación responde `ADMIN_NOT_CONFIGURED` y no muestra solicitudes.
- La clave permite aprobar o rechazar entradas pendientes, por lo que debe ser tratada como credencial privilegiada. Recomendado: añadir Cloudflare Access, gestión de roles y un registro de auditoría antes de uso real.
- `/api/config` publica solamente indicadores seguros: `turnstileConfigured` y `submissionsEnabled`; nunca revela el secret.
- **No habilitar todavía** `SUBMISSIONS_ENABLED`. Faltan privacidad y proceso de denuncias, además de pruebas de extremo a extremo.
