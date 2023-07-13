"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var dotenv = require("dotenv");
var text_splitter_1 = require("langchain/text_splitter");
var chroma_1 = require("langchain/vectorstores/chroma");
var openai_1 = require("langchain/embeddings/openai");
var openai_2 = require("langchain/chat_models/openai");
var chains_1 = require("langchain/chains");
var memory_1 = require("langchain/memory");
dotenv.config();
var prompt = require('prompt');
var get_text_chunks = function (raw_text) {
    var text_splitter = new text_splitter_1.RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });
    var chunks = text_splitter.splitText(raw_text);
    return chunks;
};
var get_vectorStore = function (text_chunks) { return __awaiter(void 0, void 0, void 0, function () {
    var embeddings, vectorStore;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                embeddings = new openai_1.OpenAIEmbeddings();
                return [4 /*yield*/, chroma_1.Chroma.fromTexts(text_chunks, [], embeddings, {})];
            case 1:
                vectorStore = _a.sent();
                // const vectorStore = await FaissStore.fromTexts(text_chunks, [], embeddings, {});
                // check if vectorStore is an instance of Chroma
                // console.log(vectorStore instanceof Chroma);
                return [2 /*return*/, vectorStore];
        }
    });
}); };
var get_conversation_chain = function (vectorStore) {
    var llm = new openai_2.ChatOpenAI();
    var memory = new memory_1.BufferMemory({
        memoryKey: "chat_history",
        returnMessages: true,
    });
    var retriever = vectorStore.asRetriever();
    var conversation_chain = chains_1.ConversationalRetrievalQAChain.fromLLM(llm, retriever, memory);
    return conversation_chain;
};
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var raw_text, text_chunks, vectorStore, conversation_chain, _loop_1, state_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    raw_text = fs.readFileSync('docs/transcript-en-US.txt', 'utf8');
                    text_chunks = get_text_chunks(raw_text);
                    return [4 /*yield*/, get_vectorStore(text_chunks)];
                case 1:
                    vectorStore = _a.sent();
                    conversation_chain = get_conversation_chain(vectorStore);
                    _loop_1 = function () {
                        var user_question, response, i, message;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    prompt.start();
                                    user_question = "";
                                    return [4 /*yield*/, prompt.get("Ask a question about your documents (or type 'exit' to quit): ", function (err, result) { return __awaiter(_this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                if (err) {
                                                    console.log(err);
                                                }
                                                else {
                                                    user_question = result["Ask a question about your documents (or type 'exit' to quit): "];
                                                }
                                                return [2 /*return*/];
                                            });
                                        }); })];
                                case 1:
                                    _b.sent();
                                    if ((user_question === null || user_question === void 0 ? void 0 : user_question.toLowerCase()) === "exit") {
                                        return [2 /*return*/, "break"];
                                    }
                                    return [4 /*yield*/, conversation_chain.call({ question: user_question })];
                                case 2:
                                    response = _b.sent();
                                    console.log(response);
                                    for (i = 0; i < response.chat_history.length; i++) {
                                        message = response.chat_history[i];
                                        if (i % 2 === 0) {
                                            console.log("User:", message.content);
                                        }
                                        else {
                                            console.log("Bot:", message.content);
                                        }
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _a.label = 2;
                case 2:
                    if (!true) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1()];
                case 3:
                    state_1 = _a.sent();
                    if (state_1 === "break")
                        return [3 /*break*/, 4];
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/];
            }
        });
    });
}
main();
