# Asistente IA con Ollama (self-hosted)

Orkpad incluye un asistente IA que responde con tus datos usando un modelo
local (Ollama). Nada sale de tu servidor.

## Requisitos

- Ollama corriendo y accesible desde el backend (`OLLAMA_BASE_URL`,
  en Docker Compose: `http://ollama:11434` si comparten red).
- Un modelo de chat (recomendado `qwen2.5:7b`) y uno de embeddings
  (recomendado `nomic-embed-text`):
  `ollama pull qwen2.5:7b && ollama pull nomic-embed-text`

## Configuración

1. Entrá a Configuración → Asistente IA.
2. Probá la conexión, elegí los modelos y guardá.
3. Presioná "Reindexar todo" para vectorizar Pizarra, Docs, tareas,
   proyectos y facturas (podés excluir tipos).
4. Abrí la sección Asistente IA y preguntá.

## Variables de entorno

| Variable | Default | Uso |
|---|---|---|
| `OLLAMA_BASE_URL` | `http://ollama:11434` | URL base de Ollama |
| `OLLAMA_CHAT_MODEL` | `qwen2.5:7b` | Modelo de chat por defecto |
| `OLLAMA_EMBED_MODEL` | `nomic-embed-text` | Modelo de embeddings |

La configuración por workspace (misma pantalla) tiene prioridad.

## Troubleshooting

- "No se pudo conectar": verificá que el container del backend llegue a
  Ollama (`curl http://ollama:11434/api/tags` desde adentro).
- Respuestas sin fuentes: falta indexar (botón Reindexar).
- Lento: normal en CPU; el primer mensaje carga el modelo en RAM y luego
  se descarga solo tras 5 min sin uso.
