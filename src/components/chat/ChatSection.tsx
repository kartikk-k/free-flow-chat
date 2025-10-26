import { addNewChatNode } from '@/store/helpers';
import { UIDataTypes, UIMessage, UITools } from 'ai';
import { Response } from '../ai-elements/response';

function ChatSection({ messages, status }: { messages: UIMessage<unknown, UIDataTypes, UITools>[], status: 'submitted' | 'streaming' | 'finished' | 'error' }) {

    return (
        <div className='relative'>
            {['submitted', 'streaming'].includes(status) && (
                <div className='animate-spin inline-flex absolute -left-8 -top-0.5'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><title>loader-2</title><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor"><path d="M9 16.25C13.0041 16.25 16.25 13.0041 16.25 9C16.25 4.99594 13.0041 1.75 9 1.75" stroke="url(#paint0_linear_4812_6)" stroke-width="1.5"></path> <path d="M9 16.25C4.99594 16.25 1.75 13.0041 1.75 9C1.75 4.99594 4.99594 1.75 9 1.75" stroke="url(#paint1_linear_4812_6)" stroke-width="1.5"></path> <circle cx="9" cy="16.25" r="0.75" fill="currentColor" data-stroke="none" stroke="none"></circle> <defs data-stroke="none" stroke="none"> <linearGradient id="paint0_linear_4812_6" x1="9" y1="2.5" x2="9" y2="16.25" gradientUnits="userSpaceOnUse" data-stroke="none" stroke="none"> <stop stop-opacity="0.5" data-stroke="none" stroke="none"></stop> <stop offset="1" data-stroke="none" stroke="none"></stop> </linearGradient> <linearGradient id="paint1_linear_4812_6" x1="9" y1="2.5" x2="9" y2="16.25" gradientUnits="userSpaceOnUse" data-stroke="none" stroke="none"> <stop stop-opacity="0.5" data-stroke="none" stroke="none"></stop> <stop offset="1" stop-opacity="0" data-stroke="none" stroke="none"></stop> </linearGradient> </defs></g></svg>
                </div>
            )}

            {messages.map(msg => (
                <div>
                    {msg.role !== 'user' && (
                        <>
                            {msg.parts.map((part, index) => (
                                <div className='space-y-4'>
                                    {part.type === 'reasoning' ? (
                                        <div className='text-xs mb-2'>
                                            {part.state === 'streaming' ? (
                                                <p>
                                                    Reasoning...
                                                </p>
                                            ) : (
                                                <div>
                                                    <p>Reasoning completed!</p>
                                                    <p>
                                                        {part.text as string}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) :
                                        part.type === 'text' && (
                                            <Response isAnimating={status === 'streaming'} key={index}>{part.text}</Response>
                                            // <div>
                                            //     {part.text === '.\n' || part.text === '.\n\n' ? (
                                            //         <br />
                                            //     ) : (
                                            //         <p>
                                            //             {part.text as string}
                                            //         </p>
                                            //     )}
                                            // </div>
                                        )}
                                </div>
                            ))}
                        </>
                    )}
                </div>
            ))}

            {/* <Conversation className="flex-1 h-full">
                <ConversationContent className='max-w-4xl mx-auto'>
                    {messages.map((message) => (
                        <div key={message.id}>
                            {message.role === 'assistant' && message.parts.filter((part) => part.type === 'source-url').length > 0 && (
                                <Sources>
                                    <SourcesTrigger
                                        count={
                                            message.parts.filter(
                                                (part) => part.type === 'source-url',
                                            ).length
                                        }
                                    />
                                    {message.parts.filter((part) => part.type === 'source-url').map((part, i) => (
                                        <SourcesContent key={`${message.id}-${i}`}>
                                            <Source
                                                key={`${message.id}-${i}`}
                                                href={part.url}
                                                title={part.url}
                                            />
                                        </SourcesContent>
                                    ))}
                                </Sources>
                            )}

                            {message.parts.map((part, i) => {
                                switch (part.type) {
                                    case 'text':
                                        return (
                                            <Fragment key={`${message.id}-${i}`}>
                                                {message.role === 'user' && (
                                                    <span className='w-full border-t border-dashed inline-block mb-1 mt-20' />
                                                )}
                                                <Message from={message.role} className={message.role === 'user' ? 'border-t border-dashed flex items-center' : ''}>
                                                    <MessageContent className='text-[13px] font-medium py-2 px-4'>
                                                        <Response className={`text-xs ${message.role === 'user' ? 'line-clamp-6' : ''}`}>
                                                            {part.text}
                                                        </Response>
                                                    </MessageContent>
                                                    {message.role === 'user' && (
                                                        <span className='inline-block w-1.5 h-6 bg-white/20' />
                                                    )}

                                                </Message>
                                            </Fragment>
                                        );
                                    case 'reasoning':
                                        return (
                                            <Reasoning
                                                key={`${message.id}-${i}`}
                                                className="w-full"
                                                isStreaming={status === 'streaming' && i === message.parts.length - 1 && message.id === messages.at(-1)?.id}
                                            >
                                                <ReasoningTrigger />
                                                <ReasoningContent>{part.text}</ReasoningContent>
                                            </Reasoning>
                                        );
                                    case 'tool-output-available':
                                        return (
                                            <div
                                                key={`${message.id}-${i}`}
                                                className="w-full"
                                            >
                                                <p>
                                                    {part.output as string}
                                                </p>
                                            </div>
                                        );
                                    default:
                                        return null;
                                }
                            })}
                        </div>


                    ))}
                    {['submitted', 'streaming'].includes(status) && <Loader />}
                </ConversationContent>
                <ConversationScrollButton />
            </Conversation> */}
        </div>
    )
}

export default ChatSection