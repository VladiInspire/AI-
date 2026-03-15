import os
import streamlit as st
import anthropic

# ── Page config ────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="IBIS In Gold – Gold Savings Assistant",
    page_icon="🪙",
    layout="centered",
)

# ── Load FAQ knowledge base ────────────────────────────────────────────────────
FAQ_PATH = os.path.join(os.path.dirname(__file__), "faq.md")

@st.cache_data
def load_faq() -> str:
    with open(FAQ_PATH, "r", encoding="utf-8") as f:
        return f.read()

FAQ_CONTENT = load_faq()

SYSTEM_PROMPT = f"""You are a helpful and friendly customer support assistant for IBIS In Gold, \
a gold savings platform. Your role is to answer questions about gold savings, account management, \
buying/selling gold, storage, fees, security, and other topics related to IBIS In Gold.

Use the following FAQ document as your primary knowledge base. When answering:
- Be concise and friendly.
- If the answer is clearly in the FAQ, base your response on that information.
- If a question is not covered in the FAQ, say so politely and suggest the customer contact \
support at support@ibisingold.com.
- Never fabricate specific prices, fees, or policies not mentioned in the FAQ.
- Do not discuss topics unrelated to IBIS In Gold or gold savings.

--- IBIS In Gold FAQ ---
{FAQ_CONTENT}
--- END FAQ ---
"""

# ── Anthropic client ───────────────────────────────────────────────────────────
@st.cache_resource
def get_client() -> anthropic.Anthropic:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        st.error(
            "ANTHROPIC_API_KEY environment variable is not set. "
            "Please set it and restart the app."
        )
        st.stop()
    return anthropic.Anthropic(api_key=api_key)

# ── UI ─────────────────────────────────────────────────────────────────────────
st.title("🪙 IBIS In Gold – Gold Savings Assistant")
st.caption("Ask me anything about gold savings, accounts, fees, or how to get started.")

# Initialise chat history
if "messages" not in st.session_state:
    st.session_state.messages = []

# Render existing messages
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# Chat input
if prompt := st.chat_input("Type your question here…"):
    # Show user message
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Build message history for the API (exclude system prompt – passed separately)
    api_messages = [
        {"role": m["role"], "content": m["content"]}
        for m in st.session_state.messages
    ]

    # Stream the assistant response
    with st.chat_message("assistant"):
        response_placeholder = st.empty()
        full_response = ""

        client = get_client()
        with client.messages.stream(
            model="claude-opus-4-6",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=api_messages,
        ) as stream:
            for text_chunk in stream.text_stream:
                full_response += text_chunk
                response_placeholder.markdown(full_response + "▌")

        response_placeholder.markdown(full_response)

    st.session_state.messages.append({"role": "assistant", "content": full_response})

# ── Sidebar ────────────────────────────────────────────────────────────────────
with st.sidebar:
    st.header("About")
    st.write(
        "This assistant is powered by Claude and uses IBIS In Gold's official FAQ "
        "as its knowledge base."
    )
    st.divider()
    st.write("**Contact Support**")
    st.write("📧 support@ibisingold.com")
    st.write("📞 +41 22 000 1234")
    st.divider()
    if st.button("Clear conversation"):
        st.session_state.messages = []
        st.rerun()
