import React, { useRef, useCallback, useEffect, type ReactElement, } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform, } from 'react-native';
import { ArrowDown, Download } from 'lucide-react-native';
import type { UIMessage } from 'ai';
import { Message, MessageContent, MessageResponse } from './message';
import { BlankProvider, useBlankContext } from './blank-context';
import type { LegendListRef, LegendListProps } from '@legendapp/list/react-native';
import { AnimatedLegendList, type AnimatedLegendListProps } from '@legendapp/list/reanimated';
export type ConversationProps = React.PropsWithChildren<{ className?: string }>;

export const Conversation = ({ children, className }: ConversationProps) => (<BlankProvider>
    <View className={`flex-1 bg-background px-4 ${className || ''}`}>
      {children}
    </View>
  </BlankProvider>);
export type ConversationEmptyStateProps = {
    title?: string;
    description?: string;
    icon?: ReactElement;
    className?: string;
};
export const ConversationEmptyState = ({ title = 'Start a conversation', description = 'Type a message below to begin chatting', icon, className, }: ConversationEmptyStateProps) => (<View className={`flex-1  items-center justify-center   ${className || ''}`}>
    <Text className="mt-4 text-3xl font-semibold text-foreground">{title}</Text>
  </View>);
export type ConversationContentProps = {
    messages: UIMessage[];
    renderItem?: LegendListProps<UIMessage>['renderItem'];
    estimatedItemSize?: number;
} & Omit<AnimatedLegendListProps<UIMessage>, 'data' | 'renderItem'>;
export const ConversationContent = ({ messages, renderItem, estimatedItemSize = 140, ...flatListProps }: ConversationContentProps) => {
    const flatListRef = useRef<LegendListRef>(null);
    const defaultRenderItem: LegendListProps<UIMessage>['renderItem'] = useCallback(({ item: message, index }) => (<Message role={message.role} index={index} message={message}>
        <MessageContent>
          {message.parts
            ?.filter((part) => part.type === 'text')
            .map((part, i) => (<MessageResponse key={i} message={message}/>))}
        </MessageContent>
      </Message>), []);
    const { blankSize } = useBlankContext();
    const prevLengthRef = useRef(messages.length);
    useEffect(() => {
        const shouldScroll = messages.length > prevLengthRef.current &&
            messages[messages.length - 1].role === 'user';
        if (shouldScroll && Platform.OS !== 'web') {
            flatListRef.current?.scrollToEnd?.();
        }
        prevLengthRef.current = messages.length;
    }, [messages]);
    const { messagesContainerHeight } = useBlankContext();
    return (<View className="flex-1" onLayout={(e) => {
            const height = e.nativeEvent.layout.height;
            messagesContainerHeight.set(height);
        }}>
      {messages.length === 0 ? (<ConversationEmptyState />) : (<AnimatedLegendList ref={flatListRef} data={messages} keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'} showsVerticalScrollIndicator={false} renderItem={renderItem || defaultRenderItem} keyExtractor={(item) => item.id} scrollEventThrottle={16} estimatedItemSize={estimatedItemSize} contentContainerStyle={{
                paddingBottom: blankSize.value,
            }} {...flatListProps}/>)}
    </View>);
};
export const ConversationScrollButton = () => (<TouchableOpacity onPress={() => { }} className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-primary h-11 w-11 items-center justify-center rounded-full shadow-lg">
    <ArrowDown size={22} className="text-primary-foreground"/>
  </TouchableOpacity>);
export type ConversationDownloadProps = {
    messages: UIMessage[];
};
export const ConversationDownload = ({ messages, }: ConversationDownloadProps) => {
    const handleDownload = useCallback(() => {
        const markdown = messages
            .map((msg) => {
            const role = msg.role === 'user' ? 'User' : 'Assistant';
            const text = msg.parts
                ?.filter((p) => p.type === 'text')
                .map((p) => p.text)
                .join('\n');
            return `**${role}:**\n${text}`;
        })
            .join('\n\n');
        Alert.alert('Download', markdown);
    }, [messages]);
    return (<TouchableOpacity onPress={handleDownload} className="absolute top-4 right-4 bg-card p-3 rounded-2xl shadow-sm">
      <Download size={20} className="text-muted-foreground"/>
    </TouchableOpacity>);
};
