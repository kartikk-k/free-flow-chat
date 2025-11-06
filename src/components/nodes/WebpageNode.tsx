import { PlaygroundActions } from '@/lib/playground';
import { usePlaygroundStore } from '@/store/Playground';
import { Handle, NodeProps, Position } from '@xyflow/react';
import { useEffect, useState } from 'react';
import { NodeChat } from '@/types/chat';
import { Response } from '../ai-elements/response';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '../ui/context-menu';

function WebpageNode(props: NodeProps) {

    const [submitted, setSubmitted] = useState(false);
    const [url, setUrl] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nodeChat, setNodeChat] = useState<NodeChat | null>(null);
    const [metadata, setMetadata] = useState<{ title?: string; description?: string } | null>(null);

    const { selectedNodeId, selectedNodeHistoricalNodeIds } = usePlaygroundStore();

    useEffect(() => {
        const chat = PlaygroundActions.getNodeChat(props.id)
        if (chat) {
            setNodeChat(chat)
            // If chat exists with messages, set submitted to true and load content
            if (chat.messages && chat.messages.length > 0) {
                setSubmitted(true)
                // Extract URL and content from messages
                const firstMessage = chat.messages[0]
                if (firstMessage && firstMessage.parts && firstMessage.parts[0]) {
                    const text = firstMessage.parts[0].text || ''
                    setUrl(firstMessage.parts[0].url || '')
                    setContent(text)
                    setMetadata(firstMessage.parts[0].metadata || null)
                }
            }
        }
    }, [props.id])

    const validateUrl = (urlString: string): boolean => {
        try {
            new URL(urlString);
            return true;
        } catch {
            return false;
        }
    }

    const handleFetchWebpage = async () => {
        if (!url.trim()) {
            setError('Please enter a URL');
            return;
        }

        if (!validateUrl(url)) {
            setError('Please enter a valid URL');
            return;
        }

        setSubmitted(true);
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/webpage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch webpage');
            }

            setContent(data.markdown);
            setMetadata(data.metadata);

            // Store in NodeChat
            const messages = [{
                role: 'assistant',
                id: props.id,
                parts: [{
                    type: 'text',
                    text: data.markdown,
                    url: url,
                    metadata: data.metadata
                }]
            }];

            PlaygroundActions.attachMessageToNode(props.id, messages);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch webpage');
            setSubmitted(false);
        } finally {
            setLoading(false);
        }
    }

    const handleAddAsSource = () => {
        let source = ""

        // if component has selected text, set it as the source
        if (window.getSelection()?.toString()) {
            source = window.getSelection()?.toString() || ""
        }

        if (source.trim()) {
            PlaygroundActions.addNewChatNode(props.id, source.trim())
        } else {
            alert("Please select some text before adding source!")
        }
    }

    const handleNewChild = () => {
        PlaygroundActions.addNewChatNode(props.id)
    }

    const handleNewWebpage = () => {
        PlaygroundActions.addNewWebpageNode(props.id)
    }

    const handleDelete = () => {
        PlaygroundActions.deleteNode(props.id)
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger>

                <div className={`flex group rounded-3xl ${selectedNodeId === props.id ? 'outline-2 outline-blue-500' : ''} ${selectedNodeHistoricalNodeIds?.includes(props.id) ? 'ring-5 ring-[#88EAC9] ring-offset-1' : ''}`}>

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
                                <button className='drag-handle__WebpageNode hover:bg-neutral-200 w-6 h-8 flex items-center justify-center rounded-md active:cursor-grabbing hover:cursor-grab'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><title>grip-dots-vertical</title><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor"><circle cx="6.75" cy="9" r=".5" fill="currentColor"></circle><circle cx="6.75" cy="3.75" r=".5" fill="currentColor"></circle><circle cx="6.75" cy="14.25" r=".5" fill="currentColor"></circle><circle cx="11.25" cy="9" r=".5" fill="currentColor"></circle><circle cx="11.25" cy="3.75" r=".5" fill="currentColor"></circle><circle cx="11.25" cy="14.25" r=".5" fill="currentColor"></circle></g></svg>
                                </button>

                                <div className='font-medium flex-1'>
                                    <button
                                        className='px-2 h-9 pr-3 rounded-lg border border-black/15 flex items-center gap-1'
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><title>globe-2</title><g stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor"><circle cx="9" cy="9" r="7.25"></circle><path d="M2.32593 11.7498H15.6741"></path><path d="M2.32593 6.25H15.6741"></path><path d="M9 1.75C7.20507 3.82733 6.1875 6.45892 6.1875 9.25C6.1875 12.0411 7.20507 14.6727 9 16.75"></path><path d="M9 1.75C10.7949 3.82733 11.8125 6.45892 11.8125 9.25C11.8125 12.0411 10.7949 14.6727 9 16.75"></path></g></svg>
                                        Webpage
                                    </button>
                                </div>

                                <button onClick={handleDelete} className='group-hover:flex hidden h-8 w-8 rounded-lg duration-200 items-center justify-center opacity-60 hover:opacity-100 hover:text-red-500'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><title>trash</title><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor"><path d="M13.6977 7.75L13.35 14.35C13.294 15.4201 12.416 16.25 11.353 16.25H6.64804C5.58404 16.25 4.70703 15.42 4.65103 14.35L4.30334 7.75"></path> <path d="M2.75 4.75H15.25"></path> <path d="M6.75 4.75V2.75C6.75 2.2 7.198 1.75 7.75 1.75H10.25C10.802 1.75 11.25 2.2 11.25 2.75V4.75"></path></g></svg>
                                </button>
                            </div>

                            {error && (
                                <p className='ml-5 p-3 pb-0 text-rose-600'>
                                    {error}
                                </p>
                            )}

                            {!submitted ? (
                                <div className='ml-5 p-3 flex flex-col gap-3'>
                                    <input
                                        type="text"
                                        className='resize-none bg-neutral-100 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        placeholder='Enter webpage URL...'
                                        onKeyDown={e => e.key === 'Enter' && handleFetchWebpage()}
                                        value={url}
                                        onChange={e => setUrl(e.target.value)}
                                    />
                                    <button
                                        onClick={handleFetchWebpage}
                                        className='px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors'
                                    >
                                        Fetch Webpage
                                    </button>
                                </div>
                            ) : (
                                <div className='ml-5 p-3 flex flex-col gap-7 select-text'>
                                    {/* URL display */}
                                    {metadata?.title && (
                                        <div className='flex flex-col gap-1'>
                                            <p className='font-semibold text-lg'>{metadata.title}</p>
                                            <a
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className='text-sm text-blue-600 hover:underline break-all'
                                            >
                                                {url}
                                            </a>
                                        </div>
                                    )}

                                    {!metadata?.title && (
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className='font-medium text-blue-600 hover:underline break-all cursor-pointer'
                                        >
                                            {url}
                                        </a>
                                    )}

                                    {/* content */}
                                    <div className='text-foreground/70 font-medium space-y-3 relative cursor-text'>
                                        {loading ? (
                                            <div className='flex items-center gap-2'>
                                                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900'></div>
                                                <span>Fetching webpage content...</span>
                                            </div>
                                        ) : (
                                            <Response>{content}</Response>
                                        )}
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
                <ContextMenuItem onClick={handleNewWebpage}>
                    <svg xmlns="http://www.w3.org/2000/svg" className='text-white' width="18" height="18" viewBox="0 0 18 18" fill="none"><title>globe-2</title><g stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor"><circle cx="9" cy="9" r="7.25"></circle><path d="M2.32593 11.7498H15.6741"></path><path d="M2.32593 6.25H15.6741"></path><path d="M9 1.75C7.20507 3.82733 6.1875 6.45892 6.1875 9.25C6.1875 12.0411 7.20507 14.6727 9 16.75"></path><path d="M9 1.75C10.7949 3.82733 11.8125 6.45892 11.8125 9.25C11.8125 12.0411 10.7949 14.6727 9 16.75"></path></g></svg>
                    New webpage
                </ContextMenuItem>
                <ContextMenuItem onClick={handleDelete} className='focus:bg-red-600/20 focus:text-red-100'>
                    <svg xmlns="http://www.w3.org/2000/svg" className='text-currentColor' width="18" height="18" viewBox="0 0 18 18"><title>trash</title><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor"><path d="M13.6977 7.75L13.35 14.35C13.294 15.4201 12.416 16.25 11.353 16.25H6.64804C5.58404 16.25 4.70703 15.42 4.65103 14.35L4.30334 7.75"></path> <path d="M2.75 4.75H15.25"></path> <path d="M6.75 4.75V2.75C6.75 2.2 7.198 1.75 7.75 1.75H10.25C10.802 1.75 11.25 2.2 11.25 2.75V4.75"></path></g></svg>
                    Delete
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    )
}

export default WebpageNode
