from fastapi import FastAPI, Form, HTTPException
from typing import Optional
import os
import psycopg2 
from fastapi import FastAPI, Request
from langchain_openai import ChatOpenAI
from fastapi.responses import HTMLResponse,FileResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI(title="chatgpt para Seguros")


app.mount("/static", StaticFiles(directory="static"), name="index.html")
templates = Jinja2Templates(directory="static")


OPENAI_API_KEY = "sk-proj-FSQBRPkgskefsRAl24WrT3BlbkFJdcegXjvRj0qOGQ4lnZft"
llm = ChatOpenAI(api_key=OPENAI_API_KEY)
db_user = "postgres"
db_pass = "321321"
db_host = "35.225.51.34"
db_port = 5432

if not OPENAI_API_KEY:
    raise ValueError("Missing environment variables: OPENAI_API_KEY")


def create_tables():
    connection = psycopg2.connect(
      host=db_host,
      port=db_port,
      user=db_user,
      password=db_pass)
    try:
        cursor = connection.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS chatgpt_requests (
                id SERIAL PRIMARY KEY,
                usuario VARCHAR(255),
                query TEXT,
                response TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        connection.commit()
        print("Tables created successfully")
    except Exception as e:
        print("Database table creation error:", e)

def save_to_database(usuario: Optional[str], query: Optional[str], response: Optional[str]):
    connection = psycopg2.connect(
      host=db_host,
      port=db_port,
      user=db_user,
      password=db_pass)
    try:
        cursor = connection.cursor()
        cursor.execute("""
            INSERT INTO chatgpt_requests (usuario, query, response)
            VALUES (%s, %s, %s)
        """, (usuario, query, response))
        connection.commit()
        print("Data saved to database successfully")
    except Exception as e:
        print("Database insertion error:", e)

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/chat")
async def chat(chat: Optional[dict]):
  from json.decoder import JSONDecodeError
  

  try:
    # Extract dat

    print("Extracted user data:")
    
    for key, value in chat.items():
      print(f"Key: {key}, Value: {value}")

    # Access specific data for processing
    user_name = chat["usuario"]
    user_query = chat["query"]

    # Basic validation
    if not user_query:
      return {"error": "Missing query field in request body."}

    # Assuming llm.invoke expects a list with a dictionary
    respuesta = llm.invoke([{"role": "system", "content": f"""
        **Experto en seguros:**
        Soy Chat, un gran modelo de lenguaje capacitado para ser informativo y comprensivo. También estoy bien versado en el ámbito de los seguros. Aquí está tu consulta: {user_query}
        Proporcione una respuesta integral e informativa, basándose en su conocimiento de los conceptos y mejores prácticas de seguros.
        """}]).content

    chatgpt_response = respuesta

    return save_to_database(user_name, user_query, chatgpt_response),chatgpt_response
  except JSONDecodeError:
    return {"error": "Invalid JSON data format in request body."}
  except Exception as e:
    print(f"Error processing request: {e}")



@app.get("/history")
async def get_chat_history(limit: int = 10):
    connection = psycopg2.connect(
                                    host=db_host,
                                    port=db_port,
                                    user=db_user,
                                    password=db_pass)
    if not connection:
        raise HTTPException(status_code=500, detail="Internal server error")
    else:

        try:
            cursor = connection.cursor()
            cursor.execute("""
                SELECT usuario, query, response, created_at
                FROM chatgpt_requests
                ORDER BY created_at DESC
                LIMIT %s
            """, (limit,))
            history = cursor.fetchall()
            return [{"usuario": usuario, "query": query, "response": response, "created_at": created_at.strftime("%Y-%m-%d %H:%M:%S")} for usuario, query, response, created_at in history]
        except Exception as e:
            print("Error fetching chat history:", e)
            raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)