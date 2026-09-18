from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv
import os


# ==========================================
# LOAD ENVIRONMENT VARIABLES
# ==========================================

load_dotenv()


# ==========================================
# CREATE FLASK APP
# ==========================================

app = Flask(__name__)

CORS(app)


# ==========================================
# OPENAI API KEY
# ==========================================

api_key = os.getenv("OPENAI_API_KEY")


if not api_key:
    print("WARNING: OPENAI_API_KEY is not set in .env")


# ==========================================
# OPENAI CLIENT
# ==========================================

client = OpenAI(
    api_key=api_key
)


# ==========================================
# HOME ROUTE
# ==========================================

@app.route("/", methods=["GET"])
def home():

    return "Aivora Backend is Running!"


# ==========================================
# CHAT ROUTE
# ==========================================

@app.route("/chat", methods=["POST"])
def chat():

    try:

        # Get JSON data from frontend
        data = request.get_json()

        if not data:
            return jsonify({
                "reply": "No message data received."
            }), 400


        # Get user's message
        user_message = data.get(
            "message",
            ""
        ).strip()


        # Check empty message
        if not user_message:

            return jsonify({
                "reply": "Please enter a message."
            }), 400


        # ==================================
        # SEND MESSAGE TO AI
        # ==================================

        response = client.responses.create(

            model="gpt-5.6-luna",

            instructions="""
You are Aivora, a helpful and friendly AI assistant.

Your job is to help the user with questions,
learning, coding, ideas, explanations and
general tasks.

Give clear and useful answers.

Use simple language when the topic is difficult.

If the user asks for code, provide working code
and explain where it should be used.

Be polite, friendly and helpful.

Do not pretend that you completed an action
that you cannot actually perform.
""",

            input=user_message
        )


        # ==================================
        # GET AI RESPONSE
        # ==================================

        ai_reply = response.output_text


        # ==================================
        # SEND RESPONSE TO FRONTEND
        # ==================================

        return jsonify({

            "reply": ai_reply

        })


    except Exception as error:

        print(
            "AIVORA ERROR:",
            error
        )


        return jsonify({

            "reply":
                "Sorry, Aivora could not process your request. Please check the backend and API key."

        }), 500


# ==========================================
# START SERVER
# ==========================================

if __name__ == "__main__":

    print("")
    print("===================================")
    print("       AIVORA BACKEND")
    print("===================================")
    print("")
    print("Server: http://127.0.0.1:5000")
    print("")
    print("Waiting for messages...")
    print("")


    app.run(

        host="127.0.0.1",

        port=5000,

        debug=True

    )