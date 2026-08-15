import os
from telebot import TeleBot, types
from database import register, get_by_tg
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.getenv("TELEGRAM_TOKEN")
if not TOKEN:
    raise SystemExit("TELEGRAM_TOKEN не задан в .env")

bot = TeleBot(TOKEN)
states = {}

@bot.message_handler(commands=["start", "help"])
def start(m):
    user = get_by_tg(m.from_user.id)
    if user:
        bot.reply_to(m, f"Вы уже зарегистрированы как <b>{user['nickname']}</b>", parse_mode="HTML")
        return
    kb = types.ReplyKeyboardMarkup(resize_keyboard=True).add("📝 Зарегистрироваться")
    bot.reply_to(m, "Нажмите кнопку для регистрации.", reply_markup=kb)

@bot.message_handler(func=lambda m: m.text == "📝 Зарегистрироваться")
def begin(m):
    if get_by_tg(m.from_user.id):
        return bot.reply_to(m, "Вы уже зарегистрированы.")
    states[m.from_user.id] = {"step": "nick"}
    bot.reply_to(m, "Введите никнейм (мин. 3 символа):")

@bot.message_handler(func=lambda m: m.from_user.id in states)
def process(m):
    st = states.get(m.from_user.id)
    if not st:
        return

    text = (m.text or "").strip()
    if st["step"] == "nick":
        if len(text) < 3:
            return bot.reply_to(m, "Слишком короткий. Ещё раз:")
        st.update(nick=text[:64], step="pass")
        bot.reply_to(m, "Придумайте пароль (мин. 4 символа):")
    else:
        if len(text) < 4:
            return bot.reply_to(m, "Слишком короткий. Ещё раз:")
        ok, msg = register(st["nick"], text, m.from_user.id)
        bot.reply_to(m, msg)
        states.pop(m.from_user.id, None)
        if ok:
            bot.send_message(
                m.chat.id,
                f"Никнейм: <b>{st['nick']}</b>\nЗаходите на сайт.",
                parse_mode="HTML",
                reply_markup=types.ReplyKeyboardRemove()
            )

if __name__ == "__main__":
    print("Bot started")
    bot.infinity_polling()
