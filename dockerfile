FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN mkdir /static

# Set the working directory in the container
WORKDIR /static

ADD . /static/
# Install any needed dependencies specified in requirements.txt
RUN pip install --upgrade pip
RUN pip install fastapi    
RUN pip install uvicorn
RUN pip install pandas
RUN pip install numpy
RUN pip install requests
RUN pip install langchain-openai
RUN pip install jinja2
RUN pip install psycopg2-binary

COPY . /static/
# Run the FastAPI application with Uvicorn
CMD ["python", "app.py"]

# Expose the port the app runs on
EXPOSE 8000