import os
from dotenv import load_dotenv
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.chat_models import ChatOpenAI
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain


def get_text_chunks(text):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    chunks = text_splitter.split_text(text)
    return chunks


def get_vectorstore(text_chunks):
    embeddings = OpenAIEmbeddings()
    vectorstore = Chroma.from_texts(texts=text_chunks, embedding=embeddings)
    return vectorstore


def get_conversation_chain(vectorstore):
    llm = ChatOpenAI()

    memory = ConversationBufferMemory(
        memory_key='chat_history', return_messages=True)
    conversation_chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=vectorstore.as_retriever(),
        memory=memory,
        verbose=True
    )
    return conversation_chain


def main():
    load_dotenv()

    with open('docs/transcript-en-US.txt') as f:
        raw_text = f.read()
    # Get the text chunks
    text_chunks = get_text_chunks(raw_text)

    # Create vector store
    vectorstore = get_vectorstore(text_chunks)

    # Create conversation chain
    conversation_chain = get_conversation_chain(vectorstore)

    while True:
        user_question = input("Ask a question about your documents (or type 'exit' to quit): ")
        if user_question.lower() == "exit":
            break
        response = conversation_chain({'question': user_question})
        print(response)

        for i, message in enumerate(response['chat_history']):
            # differentiate between user and bot messages
            if i % 2 == 0:
                print("User:", message.content)
            else:
                print("Bot:", message.content)


if __name__ == '__main__':
    main()
