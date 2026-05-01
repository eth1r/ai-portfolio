from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from openai import OpenAI
import time
from collections import defaultdict
import logging
from dotenv import load_dotenv

# Загрузка переменных из .env
load_dotenv()

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Chat Assistant API")

# CORS для frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене указать конкретный домен
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Конфигурация из env
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_TIMEOUT = int(os.getenv("OPENAI_TIMEOUT", "30"))  # секунд

# System prompt с поддержкой многострочного текста из env
SYSTEM_PROMPT = os.getenv("SYSTEM_PROMPT", """Ты — AI-ассистент сайта-портфолио Андрея, специалиста по автоматизации и AI. 

Твоя задача:
- Помогать посетителям разобраться с услугами, кейсами и форматом работы
- Отвечать на вопросы о том, как Андрей может помочь с автоматизацией поддержки, обработкой документов, AI-ассистентами и интеграциями
- Рассказывать о кейсах и подходящих решениях
- Быть полезным и дружелюбным

Если нужна персональная консультация или обсуждение конкретного проекта, направляй к контактам.""")

WELCOME_MESSAGE = os.getenv("WELCOME_MESSAGE", """Привет! Я AI-ассистент этого сайта.

Помогу разобраться с услугами, посмотреть подходящие кейсы или ответить на вопросы о том, как Андрей может помочь с автоматизацией.

Что вас интересует?""")

MANAGER_CONTACT = os.getenv("MANAGER_CONTACT", "https://t.me/eth1r")

# Настройки для подключения базы знаний (опционально)
OPENAI_ASSISTANT_ID = os.getenv("OPENAI_ASSISTANT_ID", "")  # Для использования Assistants API с vector store
VECTOR_STORE_ID = os.getenv("VECTOR_STORE_ID", "")  # ID vector store в OpenAI

# Rate limiting (простая реализация в памяти)
request_counts = defaultdict(list)
RATE_LIMIT_REQUESTS = 20  # запросов
RATE_LIMIT_WINDOW = 60  # секунд

# Хранилище сессий (в памяти, для продакшена использовать Redis)
# Для Chat Completions API: sessions[session_id] = [{"role": "...", "content": "..."}]
# Для Assistants API: sessions[session_id] = {"thread_id": "...", "messages": [...]}
sessions = {}

# Инициализация OpenAI клиента
client = None
if OPENAI_API_KEY:
    try:
        # Современный способ инициализации для SDK 1.55+
        client = OpenAI(
            api_key=OPENAI_API_KEY,
            timeout=OPENAI_TIMEOUT
        )
        logger.info("OpenAI client initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize OpenAI client: {e}")
        client = None
else:
    logger.warning("OPENAI_API_KEY not set. Chat will not work.")

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

def check_rate_limit(session_id: str) -> bool:
    """Проверка rate limit для сессии"""
    now = time.time()
    # Очищаем старые запросы
    request_counts[session_id] = [
        req_time for req_time in request_counts[session_id]
        if now - req_time < RATE_LIMIT_WINDOW
    ]
    
    # Проверяем лимит
    if len(request_counts[session_id]) >= RATE_LIMIT_REQUESTS:
        return False
    
    # Добавляем текущий запрос
    request_counts[session_id].append(now)
    return True

@app.get("/")
async def root():
    return {
        "service": "AI Chat Assistant API",
        "status": "running",
        "openai_configured": bool(OPENAI_API_KEY)
    }

@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "openai_configured": bool(OPENAI_API_KEY)
    }

@app.get("/api/config")
async def get_config():
    """Получение публичной конфигурации для виджета"""
    return {
        "welcome_message": WELCOME_MESSAGE,
        "manager_contact": MANAGER_CONTACT
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Обработка сообщения от пользователя"""
    
    # Проверка наличия API key
    if not client:
        logger.error("OpenAI API not configured")
        raise HTTPException(
            status_code=503,
            detail="OpenAI API not configured. Please set OPENAI_API_KEY."
        )
    
    # Валидация сообщения
    if not request.message or len(request.message.strip()) == 0:
        logger.warning("Empty message received")
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    if len(request.message) > 2000:
        logger.warning(f"Message too long: {len(request.message)} characters")
        raise HTTPException(status_code=400, detail="Message too long (max 2000 characters)")
    
    # Генерация session_id если не передан
    session_id = request.session_id or f"session_{int(time.time() * 1000)}"
    
    # Rate limiting
    if not check_rate_limit(session_id):
        logger.warning(f"Rate limit exceeded for session {session_id}")
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please wait a moment."
        )
    
    start_time = time.time()
    
    try:
        # Логируем запрос
        logger.info(f"Session {session_id}: Processing message (length: {len(request.message)})")
        
        # Если используется Assistants API с vector store:
        if OPENAI_ASSISTANT_ID:
            logger.info(f"Using Assistants API with assistant_id: {OPENAI_ASSISTANT_ID}")
            
            # Создаем или получаем thread для сессии
            if session_id not in sessions:
                thread = client.beta.threads.create()
                sessions[session_id] = {
                    "thread_id": thread.id,
                    "messages": []
                }
                logger.info(f"New thread created: {thread.id} for session {session_id}")
            
            thread_id = sessions[session_id]["thread_id"]
            
            # Добавляем сообщение в thread
            client.beta.threads.messages.create(
                thread_id=thread_id,
                role="user",
                content=request.message
            )
            
            # Запускаем assistant
            run = client.beta.threads.runs.create(
                thread_id=thread_id,
                assistant_id=OPENAI_ASSISTANT_ID
            )
            
            # Ожидаем завершения с timeout
            max_wait = OPENAI_TIMEOUT
            waited = 0
            while run.status in ["queued", "in_progress", "cancelling"]:
                if waited >= max_wait:
                    logger.error(f"Assistant timeout after {waited}s for session {session_id}")
                    raise TimeoutError("Assistant timeout")
                
                time.sleep(1)
                waited += 1
                run = client.beta.threads.runs.retrieve(
                    thread_id=thread_id,
                    run_id=run.id
                )
            
            # Проверяем статус
            if run.status == "failed":
                logger.error(f"Assistant run failed for session {session_id}: {run.last_error}")
                raise Exception(f"Assistant failed: {run.last_error}")
            
            if run.status == "cancelled":
                logger.error(f"Assistant run cancelled for session {session_id}")
                raise Exception("Assistant run was cancelled")
            
            # Получаем последнее сообщение от assistant
            messages_response = client.beta.threads.messages.list(
                thread_id=thread_id,
                order="desc",
                limit=1
            )
            
            assistant_message = messages_response.data[0].content[0].text.value
            
            # Сохраняем в историю сессии для логов
            sessions[session_id]["messages"].append({
                "role": "user",
                "content": request.message
            })
            sessions[session_id]["messages"].append({
                "role": "assistant",
                "content": assistant_message
            })
            
            # Логируем успешный ответ
            response_time = time.time() - start_time
            logger.info(f"Session {session_id}: Response sent successfully")
            logger.info(f"Assistant: {OPENAI_ASSISTANT_ID}, Response time: {response_time:.2f}s")
        
        else:
            # Стандартный Chat Completions API (без базы знаний)
            logger.info(f"Using Chat Completions API with model: {OPENAI_MODEL}")
            
            # Получаем или создаем историю сессии
            if session_id not in sessions:
                sessions[session_id] = [
                    {"role": "system", "content": SYSTEM_PROMPT}
                ]
                logger.info(f"New session created: {session_id}")
            
            # Добавляем сообщение пользователя
            sessions[session_id].append({
                "role": "user",
                "content": request.message
            })
            
            # Ограничиваем историю последними 20 сообщениями (+ system prompt)
            if len(sessions[session_id]) > 21:
                sessions[session_id] = [sessions[session_id][0]] + sessions[session_id][-20:]
            
            response = client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=sessions[session_id],
                temperature=0.7,
                max_tokens=500,
                timeout=OPENAI_TIMEOUT
            )
            
            assistant_message = response.choices[0].message.content
            
            # Сохраняем ответ ассистента в историю
            sessions[session_id].append({
                "role": "assistant",
                "content": assistant_message
            })
            
            # Логируем успешный ответ
            response_time = time.time() - start_time
            logger.info(f"Session {session_id}: Response sent successfully")
            logger.info(f"Model: {OPENAI_MODEL}, Response time: {response_time:.2f}s, Tokens: {response.usage.total_tokens}")
        
        return ChatResponse(
            response=assistant_message,
            session_id=session_id
        )
        
    except TimeoutError:
        response_time = time.time() - start_time
        logger.error(f"Session {session_id}: OpenAI timeout after {response_time:.2f}s")
        raise HTTPException(
            status_code=504,
            detail="Request timeout. Please try again or contact manager."
        )
    except Exception as e:
        response_time = time.time() - start_time
        logger.error(f"Session {session_id}: Error after {response_time:.2f}s - {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to process message. Please try again or contact manager."
        )

@app.post("/api/demo/telegram-return-bot", response_model=ChatResponse)
async def demo_telegram_return_bot(request: ChatRequest):
    """Демо-режим для Telegram Return Bot - не отправляет реальные заявки"""
    
    # Проверка наличия API key
    if not client:
        logger.error("OpenAI API not configured")
        raise HTTPException(
            status_code=503,
            detail="Демо временно недоступно. Можно посмотреть код проекта на GitHub или написать мне в Telegram."
        )
    
    # Валидация сообщения
    if not request.message or len(request.message.strip()) == 0:
        logger.warning("Empty message received")
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    if len(request.message) > 2000:
        logger.warning(f"Message too long: {len(request.message)} characters")
        raise HTTPException(status_code=400, detail="Message too long (max 2000 characters)")
    
    # Генерация session_id если не передан
    session_id = request.session_id or f"demo_return_{int(time.time() * 1000)}"
    
    # Rate limiting
    if not check_rate_limit(session_id):
        logger.warning(f"Rate limit exceeded for session {session_id}")
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please wait a moment."
        )
    
    start_time = time.time()
    
    # System prompt для демо-бота возвратов
    DEMO_RETURN_BOT_PROMPT = """Ты — демо-версия AI-бота для автоматизации возвратов товара в Telegram.

Твоя задача:
- Вести клиента по сценарию оформления возврата
- Собирать обязательные данные: номер заказа, причину возврата, описание проблемы
- Извлекать данные из свободного текста клиента
- Проверять корректность полей
- В конце показывать, что в рабочем режиме заявка была бы отправлена оператору

ВАЖНО: Это демо-режим. В конце диалога обязательно скажи:
"Спасибо! В рабочем режиме такая заявка была бы передана оператору. В демо-версии мы не отправляем реальные обращения — здесь можно только посмотреть, как работает сценарий."

Будь вежливым, профессиональным и помогай клиенту пройти процесс возврата."""

    try:
        logger.info(f"Demo session {session_id}: Processing message (length: {len(request.message)})")
        
        # Получаем или создаем историю сессии для демо
        if session_id not in sessions:
            sessions[session_id] = [
                {"role": "system", "content": DEMO_RETURN_BOT_PROMPT}
            ]
            logger.info(f"New demo session created: {session_id}")
        
        # Добавляем сообщение пользователя
        sessions[session_id].append({
            "role": "user",
            "content": request.message
        })
        
        # Ограничиваем историю последними 20 сообщениями (+ system prompt)
        if len(sessions[session_id]) > 21:
            sessions[session_id] = [sessions[session_id][0]] + sessions[session_id][-20:]
        
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=sessions[session_id],
            temperature=0.7,
            max_tokens=500,
            timeout=OPENAI_TIMEOUT
        )
        
        assistant_message = response.choices[0].message.content
        
        # Сохраняем ответ бота в историю
        sessions[session_id].append({
            "role": "assistant",
            "content": assistant_message
        })
        
        # Логируем успешный ответ
        response_time = time.time() - start_time
        logger.info(f"Demo session {session_id}: Response sent successfully")
        logger.info(f"Model: {OPENAI_MODEL}, Response time: {response_time:.2f}s, Tokens: {response.usage.total_tokens}")
        
        return ChatResponse(
            response=assistant_message,
            session_id=session_id
        )
        
    except TimeoutError:
        response_time = time.time() - start_time
        logger.error(f"Demo session {session_id}: OpenAI timeout after {response_time:.2f}s")
        raise HTTPException(
            status_code=504,
            detail="Бот не успел ответить. Попробуйте переформулировать вопрос короче."
        )
    except Exception as e:
        response_time = time.time() - start_time
        logger.error(f"Demo session {session_id}: Error after {response_time:.2f}s - {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Не удалось обработать сообщение. Попробуйте еще раз."
        )

@app.delete("/api/session/{session_id}")
async def clear_session(session_id: str):
    """Очистка сессии"""
    if session_id in sessions:
        del sessions[session_id]
        return {"status": "session cleared"}
    return {"status": "session not found"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
