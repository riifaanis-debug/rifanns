
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own messages" ON public.chat_messages
  FOR SELECT USING (true);

CREATE POLICY "Users can insert messages" ON public.chat_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update read status" ON public.chat_messages
  FOR UPDATE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
