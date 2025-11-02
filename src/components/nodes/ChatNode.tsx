import { getHistoricalNodeIds } from '@/helpers/playground/get-historical-node-ids';
import { addNewChatNode, attachMessageToNode, getNodeChat, deleteNode } from '@/store/helpers';
import { usePlaygroundStore } from '@/store/Playground';
import { useChat } from '@ai-sdk/react';
import { Handle, NodeProps, Position } from '@xyflow/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useState, startTransition } from 'react';
import { NodeChat } from '../../../typings';
import ChatSection from '../chat/ChatSection';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '../ui/context-menu';
import { ModelSwitcher } from '../ModelSwitcher';
import { DEFAULT_MODELS, getProviderFromModelId } from '@/lib/models/config';

function ChatNode(props: NodeProps) {

    const [submitted, setSubmitted] = useState(false);
    const [question, setQuestion] = useState('');
    const [nodeChat, setNodeChat] = useState<NodeChat | null>(null);
    
    // Initialize modelId from persisted state using lazy initializer
    const [currentModelId, setCurrentModelId] = useState<string>(() => {
        const chat = getNodeChat(props.id);
        return chat?.modelId || DEFAULT_MODELS.openai;
    });

    const { selectedNodeId, selectedNodeHistoricalNodeIds, apiKeys, getApiKey } = usePlaygroundStore();

    // Build API URL with all provider keys
    const buildApiUrl = () => {
        const params = new URLSearchParams();
        if (apiKeys.openai) params.append('openaiKey', apiKeys.openai);
        if (apiKeys.anthropic) params.append('anthropicKey', apiKeys.anthropic);
        if (apiKeys.google) params.append('googleKey', apiKeys.google);
        return `/api/agent?${params.toString()}`;
    };

    const { messages, sendMessage, status, setMessages, error } = useChat({
        transport: new DefaultChatTransport({
            api: buildApiUrl(),
            body: {
                modelId: currentModelId,
            },
        }),
        onFinish: () => {
        },
        onError: () => {
            setSubmitted(false)
        },
    });

    useEffect(() => {
        if (error) {
            const provider = getProviderFromModelId(currentModelId);
            const requiredKey = provider ? getApiKey(provider) : null;
            if (!requiredKey) {
                alert(`Please add ${provider || 'API'} key from top right!`)
            }
        }
    }, [error, currentModelId, getApiKey])

    useEffect(() => {
        const chat = getNodeChat(props.id)
        if (!chat) return;
        
        // Use startTransition to batch state updates and avoid cascading renders
        startTransition(() => {
            // If chat exists with messages, set submitted to true and load messages
            if (chat.messages && chat.messages.length > 0) {
                setSubmitted(true)
                setMessages(chat.messages)
                // Get the user's question from the first message
                const firstUserMessage = chat.messages.find(msg => msg.role === 'user')
                if (firstUserMessage && firstUserMessage.parts && firstUserMessage.parts[0]) {
                    const text = firstUserMessage.parts[0].text || ''
                    // Extract the query from the formatted message
                    // @ts-expect-error - text type checking
                    const queryMatch = text.match(/Query:\s*(.+)/s)
                    if (queryMatch) {
                        setQuestion(queryMatch[1].trim())
                    }
                }
            }
            
            // Update nodeChat
            setNodeChat(chat)
        })
    }, [props.id, setMessages])

    // Separate effect to sync modelId from chat when it changes externally
    useEffect(() => {
        const chat = getNodeChat(props.id);
        if (chat?.modelId && chat.modelId !== currentModelId) {
            // Use startTransition to defer state update and avoid synchronous setState in effect
            startTransition(() => {
                setCurrentModelId(chat.modelId!);
            });
        }
    }, [props.id, currentModelId])

    useEffect(() => {
        attachMessageToNode(props.id, messages)
        // Also update model ID in chat
        const chat = getNodeChat(props.id);
        if (chat) {
            const store = usePlaygroundStore.getState();
            store.setNodeChats(
                store.nodeChats.map(c => 
                    c.nodeId === props.id 
                        ? { ...c, modelId: currentModelId }
                        : c
                )
            );
        }
    }, [messages, props.id, currentModelId])

    const handleSendMessage = () => {
        const provider = getProviderFromModelId(currentModelId);
        const requiredKey = provider ? getApiKey(provider) : null;
        
        if (!requiredKey?.trim()) {
            alert(`Please add ${provider || 'API'} key from top right!`);
            return;
        }
        
        setSubmitted(true);

        // set historicals
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const messageHistory: any[] = [];
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

    // Removed unused handleClick and handleAdd functions

    const handleAddAsSource = () => {
        let source = ""

        // if component has selected text, set it as the source
        if (window.getSelection()?.toString()) {
            source = window.getSelection()?.toString() || ""
        }

        if (source.trim()) {
            addNewChatNode(props.id, source.trim())
        } else {
            alert("Please select some text before adding source!")
        }
    }

    const handleNewChild = () => {
        addNewChatNode(props.id)
    }

    const handleDelete = () => {
        deleteNode(props.id)
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger>

                <div className={`flex group rounded-3xl ${selectedNodeId === props.id ? 'outline- 2 outline-blue-500' : ''} ${selectedNodeHistoricalNodeIds?.includes(props.id) ? 'ring-5 ring-[#88EAC9] ring-offset-1' : ''}`}>

                    <div className={`p-4 bg-white rounded-3xl min-w-2xl ${selectedNodeHistoricalNodeIds?.includes(props.id) ? 'outline-transparent' : 'outline-black/15'} max-w-2xl relative outline-2 hover:shadow-2xl duration-150 cursor-default`}>
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
                                    <ModelSwitcher
                                        currentModelId={currentModelId}
                                        onModelChange={(modelId) => {
                                            setCurrentModelId(modelId);
                                            // Update chat with new model
                                            const chat = getNodeChat(props.id);
                                            if (chat) {
                                                const store = usePlaygroundStore.getState();
                                                store.setNodeChats(
                                                    store.nodeChats.map(c => 
                                                        c.nodeId === props.id 
                                                            ? { ...c, modelId }
                                                            : c
                                                    )
                                                );
                                            }
                                        }}
                                        compact
                                    />
                                </div>

                                <button onClick={handleDelete} className='group-hover:flex hidden h-8 w-8 rounded-lg duration-200 items-center justify-center opacity-60 hover:opacity-100 hover:text-red-500'>
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

                    {/* <div className='hidden items-center justify-center px-2 group-hover:flex'>
                        <button onClick={handleAdd} className='flex w-8 h-12 bg-neutral-900 text-white items-center justify-center rounded-lg'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><title>plus</title><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor"><line x1="9" y1="3.25" x2="9" y2="14.75"></line><line x1="3.25" y1="9" x2="14.75" y2="9"></line></g></svg>
                        </button>
                    </div> */}
                </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
                {typeof window !== undefined && window.getSelection()?.toString() && (
                    <ContextMenuItem onClick={handleAddAsSource}>
                        <svg xmlns="http://www.w3.org/2000/svg" className='text-white' width="18" height="18" viewBox="0 0 18 18"><title>text-plus</title><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor"><path d="m6,6.25h6"></path><path d="m6,9.25h2.5"></path><path d="m15.25,6.876v-2.626c0-1.1046-.8954-2-2-2H4.75c-1.1046,0-2,.8954-2,2v9.5c0,1.1046.8954,2,2,2h3.6386"></path><path d="m14,9c-2.2056,0-4,1.7944-4,4s1.7944,4,4,4,4-1.7944,4-4-1.7944-4-4-4Zm1.75,4.75h-1v1c0,.4141-.3359.75-.75.75s-.75-.3359-.75-.75v-1h-1c-.4141,0-.75-.3359-.75-.75s.3359-.75.75-.75h1v-1c0-.4141.3359-.75.75-.75s.75.3359.75.75v1h1c.4141,0,.75.3359.75.75s-.3359.75-.75.75Z" fill="currentColor" stroke-width="0"></path></g></svg>
                        Add as source
                    </ContextMenuItem>
                )}
                <ContextMenuItem onClick={handleNewChild}>
                    <svg xmlns="http://www.w3.org/2000/svg" className='text-white' width="18" height="18" viewBox="0 0 18 18"><title>connection-2</title><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor"><path d="m5.75,5.25h1.25c1.1046,0,2,.8954,2,2v3.25c0,1.1046.8954,2,2,2h1.25"></path><circle cx="3.75" cy="5.25" r="2"></circle><circle cx="14.25" cy="12.75" r="2"></circle></g></svg>
                    New child
                </ContextMenuItem>
                {/* <ContextMenuItem>Team</ContextMenuItem> */}
                {/* <ContextMenuSeparator className='opacity-40' /> */}
                <ContextMenuItem onClick={handleDelete} className='focus:bg-red-600/20 focus:text-red-100'>
                    <svg xmlns="http://www.w3.org/2000/svg" className='text-currentColor' width="18" height="18" viewBox="0 0 18 18"><title>trash</title><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor"><path d="M13.6977 7.75L13.35 14.35C13.294 15.4201 12.416 16.25 11.353 16.25H6.64804C5.58404 16.25 4.70703 15.42 4.65103 14.35L4.30334 7.75"></path> <path d="M2.75 4.75H15.25"></path> <path d="M6.75 4.75V2.75C6.75 2.2 7.198 1.75 7.75 1.75H10.25C10.802 1.75 11.25 2.2 11.25 2.75V4.75"></path></g></svg>
                    Delete
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    )
}

export default ChatNode