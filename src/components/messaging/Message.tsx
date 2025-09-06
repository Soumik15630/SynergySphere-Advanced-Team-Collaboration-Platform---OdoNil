import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Message = ({ projectId, userId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
    subscribeToMessages();
  }, [projectId]);

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('project_messages')
      .select(`
        *,
        profiles:user_id (
          name,
          email
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
      .limit(50);

    if (data) {
      setMessages(data);
      scrollToBottom();
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`chat-${projectId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'project_messages',
        filter: `project_id=eq.${projectId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
        scrollToBottom();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);
    
    const { error } = await supabase
      .from('project_messages')
      .insert({
        project_id: projectId,
        user_id: userId,
        message: newMessage.trim()
      });

    if (!error) {
      setNewMessage('');
    }
    
    setIsLoading(false);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    // UI Changes start here
    <div className="flex flex-col h-96 bg-gray-900 border border-gray-700 rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-black/20 rounded-t-lg">
        <h3 className="font-semibold flex items-center gap-2 text-white">
          <MessageCircle className="w-5 h-5 text-violet-400" />
          Team Chat
        </h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex gap-3">
            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-sm font-medium text-violet-400 shrink-0">
              {(message.profiles?.name || message.profiles?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-sm text-gray-100">
                  {message.profiles?.name || message.profiles?.email?.split('@')[0] || 'User'}
                </span>
                <span className="text-xs text-gray-400">
                  {formatTime(message.created_at)}
                </span>
              </div>
              <p className="text-sm text-gray-300 mt-1 break-words">
                {message.message}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700 bg-black/20 rounded-b-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm placeholder:text-gray-500"
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isLoading}
            className="bg-violet-600 hover:bg-violet-700 disabled:bg-gray-500 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};


export { Message };