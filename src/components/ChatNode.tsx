import { getHistoricalNodeIds } from '@/helpers/playground/get-historical-node-ids';
import { addNewChatNode, attachMessageToNode, getNodeChat } from '@/store/helpers';
import { usePlaygroundStore } from '@/store/Playground';
import { useChat } from '@ai-sdk/react';
import { Handle, NodeProps, Position } from '@xyflow/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useState } from 'react';
import { NodeChat } from '../../typings';
import ChatSection from './chat/ChatSection';


function ChatNode(props: NodeProps) {

    const [submitted, setSubmitted] = useState(false);
    const [question, setQuestion] = useState('');
    const [nodeChat, setNodeChat] = useState<NodeChat | null>(null);

    const { selectedNodeId, selectedNodeHistoricalNodeIds, apiKey } = usePlaygroundStore();

    const { messages, sendMessage, status, setMessages, error } = useChat({
        transport: new DefaultChatTransport({
            api: apiKey ? `/api/agent?apiKey=${encodeURIComponent(apiKey)}` : `/api/agent`,
        }),
        onFinish: () => {
        },
        onError: () => {
            setSubmitted(false)
        },
    });


    useEffect(() => {
        if (error && !apiKey) {
            alert("Please add API key from top right!")
        }
    }, [error])

    useEffect(() => {
        const chat = getNodeChat(props.id)
        if (chat) {
            setNodeChat(chat)
            // If chat exists with messages, set submitted to true and load messages
            if (chat.messages && chat.messages.length > 0) {
                setSubmitted(true)
                setMessages(chat.messages)
                // Get the user's question from the first message
                const firstUserMessage = chat.messages.find(msg => msg.role === 'user')
                if (firstUserMessage && firstUserMessage.parts && firstUserMessage.parts[0]) {
                    const text = firstUserMessage.parts[0].text || ''
                    // Extract the query from the formatted message
                    // @ts-ignore
                    const queryMatch = text.match(/Query:\s*(.+)/s)
                    if (queryMatch) {
                        setQuestion(queryMatch[1].trim())
                    }
                }
            }
        }
    }, [props.id, setMessages])

    useEffect(() => {
        attachMessageToNode(props.id, messages)
    }, [messages, props.id])

    const handleSendMessage = () => {
        setSubmitted(true);

        // set historicals
        let messageHistory: any[] = [];
        let nodeIds: string[] = []

        const historicalNodeIds = getHistoricalNodeIds(props.id, usePlaygroundStore.getState().connectors);

        for (const nodeId of historicalNodeIds.filter(i => i !== nodeChat?.nodeId)) {
            nodeIds.push(nodeId)
        }

        nodeIds = Array.from(new Set(nodeIds.sort((a, b) => {
            const chatA = getNodeChat(a)?.createdAt || 0
            const chatB = getNodeChat(b)?.createdAt || 0
            return new Date(chatA).getTime() - new Date(chatB).getTime()
        })))

        for (const i in nodeIds) {
            const chat = getNodeChat(nodeIds[i])
            if (chat && Array.isArray(chat.messages)) {
                console.log("Chat: ", chat.messages)
                messageHistory.push(...chat.messages)
            }
        }

        setMessages([...messageHistory])

        // send message
        sendMessage({
            role: 'user',
            id: props.id,
            parts: [
                {
                    type: 'text',
                    text: `
                    ${nodeChat?.source ? "Source (Selected source from previous/other chat):" + nodeChat?.source : ""}
                    Query: ${question} 
                    `,
                },
            ],
        });

        // reset messages
        setMessages([{
            role: 'user',
            id: props.id,
            parts: [
                {
                    type: 'text',
                    text: `
                    ${nodeChat?.source ? "Source (Selected source from previous/other chat):" + nodeChat?.source : ""}
                    Query: ${question} 
                    `,
                },
            ],
        }])
    }

    const handleClick = () => {

    }

    const handleAdd = () => {
        let source = ""

        // if component has selected text, set it as the source
        if (window.getSelection()?.toString()) {
            source = window.getSelection()?.toString() || ""
        }

        addNewChatNode(props.id, source.trim())
    }

    return (
        <div className={`flex group rounded-3xl ${selectedNodeId === props.id ? 'outline- 2 outline-blue-500' : ''} ${selectedNodeHistoricalNodeIds?.includes(props.id) ? 'ring-9 ring-blue-100 ring-offset-1' : ''}`}>

            <div className='p-4 bg-white rounded-3xl min-w-2xl max-w-2xl relative outline-2 outline-black/15 hover:shadow-2xl duration-150 cursor-default'>
                {/* selected context */}
                {nodeChat?.source && (
                    <div className='bg-neutral-200/50 px-4 py-3 rounded-[14px] mb-4 relative left-[-8px] top-[-8px] w-[calc(100%+16px)] flex items-center gap-2 text-sm' >
                        <svg xmlns="http://www.w3.org/2000/svg" className='opacity-50 shrink-0' width="18" height="18" viewBox="0 0 18 18"><title>merge</title><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor"><path d="M9.5,9l-2.172-3.752c-.358-.618-1.017-.998-1.731-.998H2.75"></path><path d="M9.5,9l-2.172,3.752c-.358,.618-1.017,.998-1.731,.998H2.75"></path><line x1="16.25" y1="9" x2="9.5" y2="9"></line><polyline points="13.5 6.25 16.25 9 13.5 11.75"></polyline></g></svg>
                        <p className='line-clamp-3'>{nodeChat.source}</p>
                    </div>
                )}

                <div className='flex flex-col gap-1'>

                    <div className='flex items-center gap-2'>
                        <button className='drag-handle__ChatNode hover:bg-neutral-200 w-6 h-8 flex items-center justify-center rounded-md active:cursor-grabbing hover:cursor-grab'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><title>grip-dots-vertical</title><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor"><circle cx="6.75" cy="9" r=".5" fill="currentColor"></circle><circle cx="6.75" cy="3.75" r=".5" fill="currentColor"></circle><circle cx="6.75" cy="14.25" r=".5" fill="currentColor"></circle><circle cx="11.25" cy="9" r=".5" fill="currentColor"></circle><circle cx="11.25" cy="3.75" r=".5" fill="currentColor"></circle><circle cx="11.25" cy="14.25" r=".5" fill="currentColor"></circle></g></svg>
                        </button>

                        <div className='font-medium flex-1'>
                            <button
                                className='px-2 h-9 pr-3 rounded-lg border border-black/15 flex items-center gap-1'
                                onClick={handleClick}
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" stroke="none" stroke-width="1px" opacity="1" filter="none"><path d="M11.2475 18.25C10.6975 18.25 10.175 18.1455 9.67999 17.9365C9.18499 17.7275 8.74499 17.436 8.35999 17.062C7.94199 17.205 7.50749 17.2765 7.05649 17.2765C6.31949 17.2765 5.63749 17.095 5.01049 16.732C4.38349 16.369 3.87749 15.874 3.49249 15.247C3.11849 14.62 2.93149 13.9215 2.93149 13.1515C2.93149 12.8325 2.97549 12.486 3.06349 12.112C2.62349 11.705 2.28249 11.2375 2.04049 10.7095C1.79849 10.1705 1.67749 9.6095 1.67749 9.0265C1.67749 8.4325 1.80399 7.8605 2.05699 7.3105C2.30999 6.7605 2.66199 6.2875 3.11299 5.8915C3.57499 5.4845 4.10849 5.204 4.71349 5.05C4.83449 4.423 5.08749 3.862 5.47249 3.367C5.86849 2.861 6.35249 2.465 6.92449 2.179C7.49649 1.893 8.10699 1.75 8.75599 1.75C9.30599 1.75 9.82849 1.8545 10.3235 2.0635C10.8185 2.2725 11.2585 2.564 11.6435 2.938C12.0615 2.795 12.496 2.7235 12.947 2.7235C13.684 2.7235 14.366 2.905 14.993 3.268C15.62 3.631 16.1205 4.126 16.4945 4.753C16.8795 5.38 17.072 6.0785 17.072 6.8485C17.072 7.1675 17.028 7.514 16.94 7.888C17.38 8.295 17.721 8.768 17.963 9.307C18.205 9.835 18.326 10.3905 18.326 10.9735C18.326 11.5675 18.1995 12.1395 17.9465 12.6895C17.6935 13.2395 17.336 13.718 16.874 14.125C16.423 14.521 15.895 14.796 15.29 14.95C15.169 15.577 14.9105 16.138 14.5145 16.633C14.1295 17.139 13.651 17.535 13.079 17.821C12.507 18.107 11.8965 18.25 11.2475 18.25ZM7.17199 16.1875C7.72199 16.1875 8.20049 16.072 8.60749 15.841L11.7095 14.059C11.8195 13.982 11.8745 13.8775 11.8745 13.7455V12.3265L7.88149 14.62C7.63949 14.763 7.39749 14.763 7.15549 14.62L4.03699 12.8215C4.03699 12.8545 4.03149 12.893 4.02049 12.937C4.02049 12.981 4.02049 13.047 4.02049 13.135C4.02049 13.696 4.15249 14.213 4.41649 14.686C4.69149 15.148 5.07099 15.511 5.55499 15.775C6.03899 16.05 6.57799 16.1875 7.17199 16.1875ZM7.33699 13.498C7.40299 13.531 7.46349 13.5475 7.51849 13.5475C7.57349 13.5475 7.62849 13.531 7.68349 13.498L8.92099 12.7885L4.94449 10.4785C4.70249 10.3355 4.58149 10.121 4.58149 9.835V6.2545C4.03149 6.4965 3.59149 6.8705 3.26149 7.3765C2.93149 7.8715 2.76649 8.4215 2.76649 9.0265C2.76649 9.5655 2.90399 10.0825 3.17899 10.5775C3.45399 11.0725 3.81149 11.4465 4.25149 11.6995L7.33699 13.498ZM11.2475 17.161C11.8305 17.161 12.3585 17.029 12.8315 16.765C13.3045 16.501 13.6785 16.138 13.9535 15.676C14.2285 15.214 14.366 14.697 14.366 14.125V10.561C14.366 10.429 14.311 10.33 14.201 10.264L12.947 9.538V14.1415C12.947 14.4275 12.826 14.642 12.584 14.785L9.46549 16.5835C10.0045 16.9685 10.5985 17.161 11.2475 17.161ZM11.8745 11.122V8.878L10.01 7.822L8.12899 8.878V11.122L10.01 12.178L11.8745 11.122ZM7.05649 5.8585C7.05649 5.5725 7.17749 5.358 7.41949 5.215L10.538 3.4165C9.99899 3.0315 9.40499 2.839 8.75599 2.839C8.17299 2.839 7.64499 2.971 7.17199 3.235C6.69899 3.499 6.32499 3.862 6.04999 4.324C5.78599 4.786 5.65399 5.303 5.65399 5.875V9.4225C5.65399 9.5545 5.70899 9.659 5.81899 9.736L7.05649 10.462V5.8585ZM15.4385 13.7455C15.9885 13.5035 16.423 13.1295 16.742 12.6235C17.072 12.1175 17.237 11.5675 17.237 10.9735C17.237 10.4345 17.0995 9.9175 16.8245 9.4225C16.5495 8.9275 16.192 8.5535 15.752 8.3005L12.6665 6.5185C12.6005 6.4745 12.54 6.458 12.485 6.469C12.43 6.469 12.375 6.4855 12.32 6.5185L11.0825 7.2115L15.0755 9.538C15.1965 9.604 15.2845 9.692 15.3395 9.802C15.4055 9.901 15.4385 10.022 15.4385 10.165V13.7455ZM12.122 5.3635C12.364 5.2095 12.606 5.2095 12.848 5.3635L15.983 7.195C15.983 7.118 15.983 7.019 15.983 6.898C15.983 6.37 15.851 5.8695 15.587 5.3965C15.334 4.9125 14.9655 4.5275 14.4815 4.2415C14.0085 3.9555 13.4585 3.8125 12.8315 3.8125C12.2815 3.8125 11.803 3.928 11.396 4.159L8.29399 5.941C8.18399 6.018 8.12899 6.1225 8.12899 6.2545V7.6735L12.122 5.3635Z"></path></svg>
                                GPT-5
                            </button>
                            {/* <p>{props.id}</p> */}
                        </div>

                        <button className='group-hover:flex hidden h-8 w-8 rounded-lg duration-200 items-center justify-center opacity-60 hover:opacity-100 hover:text-red-500'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><title>trash</title><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor"><path d="M13.6977 7.75L13.35 14.35C13.294 15.4201 12.416 16.25 11.353 16.25H6.64804C5.58404 16.25 4.70703 15.42 4.65103 14.35L4.30334 7.75"></path> <path d="M2.75 4.75H15.25"></path> <path d="M6.75 4.75V2.75C6.75 2.2 7.198 1.75 7.75 1.75H10.25C10.802 1.75 11.25 2.2 11.25 2.75V4.75"></path></g></svg>
                        </button>
                    </div>

                    {error && (
                        <p className='ml-5 p-3 pb-0 text-rose-600'>
                            Error generating response. Please try again!
                        </p>
                    )}

                    {!submitted ? (
                        <textarea
                            id=""
                            name=""
                            className='resize-none bg- neutral-100 ml-5 p-3 focus:outline-none'
                            placeholder='Enter your prompt here...'
                            rows={5}
                            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                        >
                        </textarea>
                    ) : (

                        <div className='ml-5 p-3 flex flex-col gap-7 select-text'>
                            {/* question */}
                            <p className='font-medium cursor-text'>
                                {question}
                            </p>

                            {/* response */}
                            <div className='text-foreground/70 font-medium space-y-3 relative cursor-text'>

                                <ChatSection
                                    messages={messages}
                                    status={status as 'submitted' | 'streaming' | 'finished' | 'error'}
                                />
                                {/* 
                                <p>I'll help you create a minimal Vercel-like deployment platform using AWS services. Here's a comprehensive plan with the core components needed:</p>

                                <p className='text-2xl mt-5'>Core Architecture Components</p>
                                <p>I'll help you create a minimal Vercel-like deployment platform using AWS services. Here's a comprehensive plan with the core components needed:</p>
                                <ul className='list-disc list-inside ml-2'>
                                    <li>AWS Amplify</li>
                                    <li>AWS CloudFront</li>
                                    <li>AWS Lambda</li>
                                    <li>AWS API Gateway</li>
                                    <li>AWS DynamoDB</li>
                                    <li>AWS S3</li>
                                    <li>AWS CloudWatch</li>
                                    <li>AWS CloudWatch Logs</li>
                                </ul>

                                <p>I'll help you create a minimal Vercel-like deployment platform using AWS services. Here's a comprehensive plan with the core components needed:</p> */}

                            </div>
                        </div>

                    )}
                </div>

                <>
                    <Handle type="target" position={Position.Top} id={'a1'} />
                    <Handle type="target" position={Position.Left} id={'a2'} />
                    <Handle type="source" position={Position.Right} id={'a3'} />
                    <Handle type="source" position={Position.Bottom} id={'a4'} />
                </>
            </div>

            <div className='hidden items-center justify-center px-2 group-hover:flex'>
                <button onClick={handleAdd} className='flex w-8 h-12 bg-neutral-900 text-white items-center justify-center rounded-lg'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><title>plus</title><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor"><line x1="9" y1="3.25" x2="9" y2="14.75"></line><line x1="3.25" y1="9" x2="14.75" y2="9"></line></g></svg>
                </button>
            </div>
        </div>
    )
}

export default ChatNode