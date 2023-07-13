import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Chroma } from "langchain/vectorstores/chroma";
import { FaissStore } from "langchain/vectorstores/faiss";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";



dotenv.config();
const prompt = require('prompt');
const get_text_chunks = (raw_text: string) => {
  const text_splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const chunks= text_splitter.splitText(raw_text);
  return chunks;
}

const get_vectorStore = async (text_chunks) => {
  const embeddings = new OpenAIEmbeddings();
  const vectorStore = await Chroma.fromTexts(text_chunks, [], embeddings, {});
  // const vectorStore = await FaissStore.fromTexts(text_chunks, [], embeddings, {});
  
  // check if vectorStore is an instance of Chroma
  // console.log(vectorStore instanceof Chroma);
  return vectorStore;
}

const get_conversation_chain = (vectorStore :Chroma) => {
  const llm = new ChatOpenAI();
  const memory = new BufferMemory({
    memoryKey: "chat_history",
    returnMessages: true,
  });
  const retriever = vectorStore.asRetriever();
  const conversation_chain = ConversationalRetrievalQAChain.fromLLM(
    llm, 
    retriever, 
    memory,
  );
  return conversation_chain;
}

async function main(): Promise<void> {
  const raw_text = fs.readFileSync('docs/transcript-en-US.txt', 'utf8');
  const text_chunks = get_text_chunks(raw_text);
  // console.log(text_chunks);
  const vectorStore = await get_vectorStore(text_chunks);
  const conversation_chain = get_conversation_chain(vectorStore);

  while (true) {
    prompt.start();
    let user_question = ""

    await prompt.get("Ask a question about your documents (or type 'exit' to quit): ", async (err, result) => {
      if (err) {
        console.log(err);
      } else {
         user_question = result["Ask a question about your documents (or type 'exit' to quit): "];
    }});

    if (user_question?.toLowerCase() === "exit") {
      break;
    }
    const response = await conversation_chain.call({ question: user_question });
    console.log(response);

    for (let i = 0; i < response.chat_history.length; i++) {
      const message = response.chat_history[i];
      if (i % 2 === 0) {
        console.log("User:", message.content);
      } else {
        console.log("Bot:", message.content);
      }
    }
  }
}

main();